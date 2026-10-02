<?php

namespace administrador\Modules\ModuleClienteReportes\Model\reportes;

    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
        require '../../../../vendor/autoload.php';
        require('../../ModulePugins/fpdf/fpdf.php');
    /*<Includes>*/

    /*<use>*/
        use PhpOffice\PhpSpreadsheet\Spreadsheet;
        use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
        use administrador\Modules\ModulePugins\Conection\Conection as Conection;
        use \FPDF;
    /*<use>*/

    class reportes extends Conection {

        /*<Method construc>*/
            public function __construct(){
                parent::__construct();
            }
        /*<Method construc>*/

        /*<REPORTE MENSAJES POR FECHA>*/
            public function reporteMensajes($fechaInicio, $fechaFin, $idCliente){
                /*<Variables>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['totalEnviados']   = 0;
                    $JSON_RESULT['totalRecibidos']  = 0;
                    $JSON_RESULT['totalMensajes']   = 0;
                    $JSON_RESULT['promedioDiario']  = 0;
                /*</Variables>*/

                /*<Query - Reporte agrupado por fecha e instancia>*/
                    $querySelect = "SELECT
                                        DATE(l.fechaCreacion) as fecha,
                                        COALESCE(i.nombre, 'Sin instancia') as instancia,
                                        SUM(CASE WHEN l.tipoRespuesta = 'ENVIADO' OR l.tipoRespuesta = 'BOT' THEN 1 ELSE 0 END) as enviados,
                                        SUM(CASE WHEN l.tipoRespuesta = 'RECIBIDO' OR l.tipoRespuesta = 'CLIENTE' THEN 1 ELSE 0 END) as recibidos,
                                        COUNT(*) as total
                                    FROM logs_view l
                                    LEFT JOIN instancia i ON l.idCliente = i.idCliente AND i.bstate = 1
                                    WHERE
                                        l.idCliente = ".$idCliente." AND
                                        l.bstate = 1 AND
                                        DATE(l.fechaCreacion) >= '".$fechaInicio."' AND
                                        DATE(l.fechaCreacion) <= '".$fechaFin."'
                                    GROUP BY DATE(l.fechaCreacion), i.nombre
                                    ORDER BY fecha DESC, instancia ASC";
                /*</Query>*/

                $JSON_RESULT['querySelect'] = $querySelect;

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                    $totalEnviados = 0;
                    $totalRecibidos = 0;
                    $diasUnicos = [];

                    if ($resultQuery->num_rows > 0) {
                        while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                            array_push($JSON_RESULT['information'], $row);
                            $totalEnviados += intval($row['enviados']);
                            $totalRecibidos += intval($row['recibidos']);
                            $diasUnicos[$row['fecha']] = true;
                        }
                    }

                    $JSON_RESULT['totalEnviados'] = $totalEnviados;
                    $JSON_RESULT['totalRecibidos'] = $totalRecibidos;
                    $JSON_RESULT['totalMensajes'] = $totalEnviados + $totalRecibidos;

                    $numDias = count($diasUnicos);
                    $JSON_RESULT['promedioDiario'] = $numDias > 0 ? round(($totalEnviados + $totalRecibidos) / $numDias, 0) : 0;

                    $JSON_RESULT['message'] = "Good";
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }

                $this->closet();
                return $JSON_RESULT;
            }
        /*</REPORTE MENSAJES POR FECHA>*/

        /*<EXPORTAR EXCEL>*/
            public function exportarExcel($fechaInicio, $fechaFin, $idCliente){
                $JSON_RESULT = [];
                $JSON_RESULT['message'] = '';
                $JSON_RESULT['error'] = '';

                $querySelect = "SELECT
                                    DATE(l.fechaCreacion) as fecha,
                                    COALESCE(i.nombre, 'Sin instancia') as instancia,
                                    SUM(CASE WHEN l.tipoRespuesta = 'ENVIADO' OR l.tipoRespuesta = 'BOT' THEN 1 ELSE 0 END) as enviados,
                                    SUM(CASE WHEN l.tipoRespuesta = 'RECIBIDO' OR l.tipoRespuesta = 'CLIENTE' THEN 1 ELSE 0 END) as recibidos,
                                    COUNT(*) as total
                                FROM logs_view l
                                LEFT JOIN instancia i ON l.idCliente = i.idCliente AND i.bstate = 1
                                WHERE
                                    l.idCliente = ".$idCliente." AND
                                    l.bstate = 1 AND
                                    DATE(l.fechaCreacion) >= '".$fechaInicio."' AND
                                    DATE(l.fechaCreacion) <= '".$fechaFin."'
                                GROUP BY DATE(l.fechaCreacion), i.nombre
                                ORDER BY fecha DESC, instancia ASC";

                $spreadsheet = new Spreadsheet();
                $nombre = 'REPORTE_MENSAJES_'.date("Ymdhis");
                $tempPath = '../../../../temp/';

                // Crear directorio si no existe
                if (!is_dir($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                if ($result = mysqli_query($this->Connection, $querySelect)) {
                    $sheet = $spreadsheet->getActiveSheet();

                    // Titulo
                    $sheet->setCellValue('A1', 'Reporte de Mensajes');
                    $sheet->mergeCells('A1:E1');
                    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                    $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    // Subtitulo con fechas
                    $sheet->setCellValue('A2', 'Periodo: '.$fechaInicio.' al '.$fechaFin);
                    $sheet->mergeCells('A2:E2');
                    $sheet->getStyle('A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    // Encabezados
                    $sheet->setCellValue('A4', 'Fecha');
                    $sheet->setCellValue('B4', 'Instancia');
                    $sheet->setCellValue('C4', 'Enviados');
                    $sheet->setCellValue('D4', 'Recibidos');
                    $sheet->setCellValue('E4', 'Total');

                    // Estilo encabezados
                    $sheet->getStyle('A4:E4')->getFont()->setBold(true);
                    $sheet->getStyle('A4:E4')->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('25D366');
                    $sheet->getStyle('A4:E4')->getFont()->getColor()->setRGB('FFFFFF');

                    $i = 5;
                    $totalEnviados = 0;
                    $totalRecibidos = 0;
                    $totalMensajes = 0;

                    while($r = $result->fetch_array(MYSQLI_ASSOC)){
                        $fechaFormato = date('d/m/Y', strtotime($r['fecha']));

                        $sheet->setCellValue('A'.$i, $fechaFormato);
                        $sheet->setCellValue('B'.$i, $r['instancia']);
                        $sheet->setCellValue('C'.$i, intval($r['enviados']));
                        $sheet->setCellValue('D'.$i, intval($r['recibidos']));
                        $sheet->setCellValue('E'.$i, intval($r['total']));

                        $totalEnviados += intval($r['enviados']);
                        $totalRecibidos += intval($r['recibidos']);
                        $totalMensajes += intval($r['total']);
                        $i++;
                    }

                    // Fila de totales
                    $sheet->setCellValue('A'.$i, 'TOTALES');
                    $sheet->setCellValue('C'.$i, $totalEnviados);
                    $sheet->setCellValue('D'.$i, $totalRecibidos);
                    $sheet->setCellValue('E'.$i, $totalMensajes);
                    $sheet->getStyle('A'.$i.':E'.$i)->getFont()->setBold(true);
                    $sheet->getStyle('A'.$i.':E'.$i)->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('E8E8E8');

                    // Ajustar ancho de columnas
                    foreach(range('A','E') as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }

                    $writer = new Xlsx($spreadsheet);
                    $writer->save($tempPath.$nombre.'.xlsx');

                    $SERVER = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
                    $JSON_RESULT['message'] = 'Good';
                    $JSON_RESULT['URL'] = $SERVER.'/temp/'.$nombre.'.xlsx';
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                    $JSON_RESULT['error'] = mysqli_error($this->Connection);
                }

                $this->closet();
                return $JSON_RESULT;
            }
        /*</EXPORTAR EXCEL>*/

        /*<EXPORTAR PDF>*/
            public function exportarPDF($fechaInicio, $fechaFin, $idCliente){
                $querySelect = "SELECT
                                    DATE(l.fechaCreacion) as fecha,
                                    COALESCE(i.nombre, 'Sin instancia') as instancia,
                                    SUM(CASE WHEN l.tipoRespuesta = 'ENVIADO' OR l.tipoRespuesta = 'BOT' THEN 1 ELSE 0 END) as enviados,
                                    SUM(CASE WHEN l.tipoRespuesta = 'RECIBIDO' OR l.tipoRespuesta = 'CLIENTE' THEN 1 ELSE 0 END) as recibidos,
                                    COUNT(*) as total
                                FROM logs_view l
                                LEFT JOIN instancia i ON l.idCliente = i.idCliente AND i.bstate = 1
                                WHERE
                                    l.idCliente = ".$idCliente." AND
                                    l.bstate = 1 AND
                                    DATE(l.fechaCreacion) >= '".$fechaInicio."' AND
                                    DATE(l.fechaCreacion) <= '".$fechaFin."'
                                GROUP BY DATE(l.fechaCreacion), i.nombre
                                ORDER BY fecha DESC, instancia ASC";

                $pdf = new \FPDF('P','mm','A4');
                $pdf->AddPage();

                // Titulo
                $pdf->SetFont('Arial','B',16);
                $pdf->SetTextColor(37, 211, 102); // Verde WhatsApp
                $pdf->Cell(0, 10, utf8_decode('Reporte de Mensajes'), 0, 1, 'C');

                // Subtitulo
                $pdf->SetFont('Arial','',10);
                $pdf->SetTextColor(100, 100, 100);
                $pdf->Cell(0, 6, utf8_decode('Periodo: '.$fechaInicio.' al '.$fechaFin), 0, 1, 'C');
                $pdf->Ln(5);

                // Encabezados de tabla
                $pdf->SetFillColor(37, 211, 102); // Verde WhatsApp
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont('Arial','B',10);
                $pdf->Cell(35, 8, 'Fecha', 1, 0, 'C', true);
                $pdf->Cell(60, 8, 'Instancia', 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Enviados', 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Recibidos', 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Total', 1, 1, 'C', true);

                $pdf->SetFont('Arial','',9);
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetFillColor(245, 245, 245);

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                $totalEnviados = 0;
                $totalRecibidos = 0;
                $totalMensajes = 0;
                $fill = false;

                if ($result = mysqli_query($this->Connection, $querySelect)) {
                    while($r = $result->fetch_array(MYSQLI_ASSOC)){
                        $fechaFormato = date('d/m/Y', strtotime($r['fecha']));

                        $pdf->Cell(35, 7, $fechaFormato, 1, 0, 'C', $fill);
                        $pdf->Cell(60, 7, utf8_decode(substr($r['instancia'], 0, 30)), 1, 0, 'L', $fill);
                        $pdf->Cell(30, 7, $r['enviados'], 1, 0, 'C', $fill);
                        $pdf->Cell(30, 7, $r['recibidos'], 1, 0, 'C', $fill);
                        $pdf->Cell(30, 7, $r['total'], 1, 1, 'C', $fill);

                        $totalEnviados += intval($r['enviados']);
                        $totalRecibidos += intval($r['recibidos']);
                        $totalMensajes += intval($r['total']);
                        $fill = !$fill;
                    }
                }
                $this->closet();

                // Fila de totales
                $pdf->SetFont('Arial','B',10);
                $pdf->SetFillColor(200, 200, 200);
                $pdf->Cell(35, 8, 'TOTALES', 1, 0, 'C', true);
                $pdf->Cell(60, 8, '', 1, 0, 'C', true);
                $pdf->Cell(30, 8, $totalEnviados, 1, 0, 'C', true);
                $pdf->Cell(30, 8, $totalRecibidos, 1, 0, 'C', true);
                $pdf->Cell(30, 8, $totalMensajes, 1, 1, 'C', true);

                // Guardar PDF
                $nombre = 'REPORTE_MENSAJES_'.date("Ymdhis").'.pdf';
                $tempPath = '../../../../temp/';

                // Crear directorio si no existe
                if (!is_dir($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $pdf->Output('F', $tempPath.$nombre);

                $SERVER = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
                header('Location: '.$SERVER.'/temp/'.$nombre);
                exit;
            }
        /*</EXPORTAR PDF>*/

        // ============================================================================
        // REPORTES DE MENSAJES POR AGENTES
        // ============================================================================

        /*<REPORTE MENSAJES POR AGENTE>*/
            public function reporteMensajesAgentes($fechaInicio, $fechaFin, $idCliente){
                /*<Variables>*/
                    $JSON_RESULT                        = [];
                    $JSON_RESULT['information']         = [];
                    $JSON_RESULT['message']             = '';
                    $JSON_RESULT['error']               = '';
                    $JSON_RESULT['totalMensajes']       = 0;
                    $JSON_RESULT['totalAgentes']        = 0;
                    $JSON_RESULT['agenteTopNombre']     = '';
                    $JSON_RESULT['agenteTopMensajes']   = 0;
                /*</Variables>*/

                /*<Query - Reporte agrupado por agente>*/
                    $querySelect = "SELECT
                                        a.idAgente,
                                        a.nombre,
                                        a.telefono,
                                        COALESCE(i.nombre, 'Sin instancia') as instancia,
                                        COUNT(ma.idMagente) as totalMensajes,
                                        SUM(CASE WHEN ma.observacion LIKE '%ENVIADO%' THEN 1 ELSE 0 END) as enviados,
                                        SUM(CASE WHEN ma.observacion LIKE '%RECIBIDO%' THEN 1 ELSE 0 END) as recibidos
                                    FROM agentes a
                                    LEFT JOIN mensajesAgente ma ON a.idAgente = ma.idAgente
                                        AND DATE(ma.fechaCreacion) >= '".$fechaInicio."'
                                        AND DATE(ma.fechaCreacion) <= '".$fechaFin."'
                                        AND ma.bstate = 1
                                    LEFT JOIN instancia i ON a.idCliente = i.idCliente AND i.bstate = 1
                                    WHERE
                                        a.idCliente = ".$idCliente." AND
                                        a.bstate = 1
                                    GROUP BY a.idAgente, a.nombre, a.telefono, i.nombre
                                    ORDER BY totalMensajes DESC";
                /*</Query>*/

                $JSON_RESULT['querySelect'] = $querySelect;

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                    $totalMensajes = 0;
                    $posicion = 0;
                    $agentes = [];

                    if ($resultQuery->num_rows > 0) {
                        while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                            $posicion++;
                            $row['posicion'] = $posicion;
                            $row['totalMensajes'] = intval($row['totalMensajes']);
                            $row['enviados'] = intval($row['enviados']);
                            $row['recibidos'] = intval($row['recibidos']);
                            $totalMensajes += $row['totalMensajes'];
                            array_push($agentes, $row);
                        }
                    }

                    // Calcular porcentaje para cada agente
                    foreach ($agentes as &$agente) {
                        $agente['porcentaje'] = $totalMensajes > 0
                            ? round(($agente['totalMensajes'] / $totalMensajes) * 100, 1)
                            : 0;
                    }

                    $JSON_RESULT['information'] = $agentes;
                    $JSON_RESULT['totalMensajes'] = $totalMensajes;
                    $JSON_RESULT['totalAgentes'] = count($agentes);

                    // Agente top
                    if (count($agentes) > 0) {
                        $JSON_RESULT['agenteTopNombre'] = $agentes[0]['nombre'];
                        $JSON_RESULT['agenteTopMensajes'] = $agentes[0]['totalMensajes'];
                    }

                    $JSON_RESULT['message'] = "Good";
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }

                $this->closet();
                return $JSON_RESULT;
            }
        /*</REPORTE MENSAJES POR AGENTE>*/

        /*<EXPORTAR EXCEL AGENTES>*/
            public function exportarExcelAgentes($fechaInicio, $fechaFin, $idCliente){
                $JSON_RESULT = [];
                $JSON_RESULT['message'] = '';
                $JSON_RESULT['error'] = '';

                $querySelect = "SELECT
                                    a.idAgente,
                                    a.nombre,
                                    a.telefono,
                                    COALESCE(i.nombre, 'Sin instancia') as instancia,
                                    COUNT(ma.idMagente) as totalMensajes,
                                    SUM(CASE WHEN ma.observacion LIKE '%ENVIADO%' THEN 1 ELSE 0 END) as enviados,
                                    SUM(CASE WHEN ma.observacion LIKE '%RECIBIDO%' THEN 1 ELSE 0 END) as recibidos
                                FROM agentes a
                                LEFT JOIN mensajesAgente ma ON a.idAgente = ma.idAgente
                                    AND DATE(ma.fechaCreacion) >= '".$fechaInicio."'
                                    AND DATE(ma.fechaCreacion) <= '".$fechaFin."'
                                    AND ma.bstate = 1
                                LEFT JOIN instancia i ON a.idCliente = i.idCliente AND i.bstate = 1
                                WHERE
                                    a.idCliente = ".$idCliente." AND
                                    a.bstate = 1
                                GROUP BY a.idAgente, a.nombre, a.telefono, i.nombre
                                ORDER BY totalMensajes DESC";

                $spreadsheet = new Spreadsheet();
                $nombre = 'REPORTE_AGENTES_'.date("Ymdhis");
                $tempPath = '../../../../temp/';

                // Crear directorio si no existe
                if (!is_dir($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                if ($result = mysqli_query($this->Connection, $querySelect)) {
                    $sheet = $spreadsheet->getActiveSheet();

                    // Titulo
                    $sheet->setCellValue('A1', 'Reporte de Mensajes por Agentes');
                    $sheet->mergeCells('A1:G1');
                    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                    $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    // Subtitulo con fechas
                    $sheet->setCellValue('A2', 'Periodo: '.$fechaInicio.' al '.$fechaFin);
                    $sheet->mergeCells('A2:G2');
                    $sheet->getStyle('A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    // Encabezados
                    $sheet->setCellValue('A4', 'Posición');
                    $sheet->setCellValue('B4', 'Agente');
                    $sheet->setCellValue('C4', 'Teléfono');
                    $sheet->setCellValue('D4', 'Instancia');
                    $sheet->setCellValue('E4', 'Enviados');
                    $sheet->setCellValue('F4', 'Recibidos');
                    $sheet->setCellValue('G4', 'Total');

                    // Estilo encabezados
                    $sheet->getStyle('A4:G4')->getFont()->setBold(true);
                    $sheet->getStyle('A4:G4')->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('25D366');
                    $sheet->getStyle('A4:G4')->getFont()->getColor()->setRGB('FFFFFF');

                    $i = 5;
                    $posicion = 0;
                    $totalEnviados = 0;
                    $totalRecibidos = 0;
                    $totalMensajes = 0;

                    while($r = $result->fetch_array(MYSQLI_ASSOC)){
                        $posicion++;

                        $sheet->setCellValue('A'.$i, $posicion);
                        $sheet->setCellValue('B'.$i, $r['nombre']);
                        $sheet->setCellValue('C'.$i, $r['telefono']);
                        $sheet->setCellValue('D'.$i, $r['instancia']);
                        $sheet->setCellValue('E'.$i, intval($r['enviados']));
                        $sheet->setCellValue('F'.$i, intval($r['recibidos']));
                        $sheet->setCellValue('G'.$i, intval($r['totalMensajes']));

                        $totalEnviados += intval($r['enviados']);
                        $totalRecibidos += intval($r['recibidos']);
                        $totalMensajes += intval($r['totalMensajes']);
                        $i++;
                    }

                    // Fila de totales
                    $sheet->setCellValue('A'.$i, 'TOTALES');
                    $sheet->setCellValue('E'.$i, $totalEnviados);
                    $sheet->setCellValue('F'.$i, $totalRecibidos);
                    $sheet->setCellValue('G'.$i, $totalMensajes);
                    $sheet->getStyle('A'.$i.':G'.$i)->getFont()->setBold(true);
                    $sheet->getStyle('A'.$i.':G'.$i)->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('E8E8E8');

                    // Ajustar ancho de columnas
                    foreach(range('A','G') as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }

                    $writer = new Xlsx($spreadsheet);
                    $writer->save($tempPath.$nombre.'.xlsx');

                    $SERVER = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
                    $JSON_RESULT['message'] = 'Good';
                    $JSON_RESULT['URL'] = $SERVER.'/temp/'.$nombre.'.xlsx';
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                    $JSON_RESULT['error'] = mysqli_error($this->Connection);
                }

                $this->closet();
                return $JSON_RESULT;
            }
        /*</EXPORTAR EXCEL AGENTES>*/

        /*<EXPORTAR PDF AGENTES>*/
            public function exportarPDFAgentes($fechaInicio, $fechaFin, $idCliente){
                $querySelect = "SELECT
                                    a.idAgente,
                                    a.nombre,
                                    a.telefono,
                                    COALESCE(i.nombre, 'Sin instancia') as instancia,
                                    COUNT(ma.idMagente) as totalMensajes,
                                    SUM(CASE WHEN ma.observacion LIKE '%ENVIADO%' THEN 1 ELSE 0 END) as enviados,
                                    SUM(CASE WHEN ma.observacion LIKE '%RECIBIDO%' THEN 1 ELSE 0 END) as recibidos
                                FROM agentes a
                                LEFT JOIN mensajesAgente ma ON a.idAgente = ma.idAgente
                                    AND DATE(ma.fechaCreacion) >= '".$fechaInicio."'
                                    AND DATE(ma.fechaCreacion) <= '".$fechaFin."'
                                    AND ma.bstate = 1
                                LEFT JOIN instancia i ON a.idCliente = i.idCliente AND i.bstate = 1
                                WHERE
                                    a.idCliente = ".$idCliente." AND
                                    a.bstate = 1
                                GROUP BY a.idAgente, a.nombre, a.telefono, i.nombre
                                ORDER BY totalMensajes DESC";

                $pdf = new \FPDF('L','mm','A4'); // Landscape para más columnas
                $pdf->AddPage();

                // Titulo
                $pdf->SetFont('Arial','B',16);
                $pdf->SetTextColor(37, 211, 102); // Verde WhatsApp
                $pdf->Cell(0, 10, utf8_decode('Reporte de Mensajes por Agentes'), 0, 1, 'C');

                // Subtitulo
                $pdf->SetFont('Arial','',10);
                $pdf->SetTextColor(100, 100, 100);
                $pdf->Cell(0, 6, utf8_decode('Periodo: '.$fechaInicio.' al '.$fechaFin), 0, 1, 'C');
                $pdf->Ln(5);

                // Encabezados de tabla
                $pdf->SetFillColor(37, 211, 102); // Verde WhatsApp
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont('Arial','B',10);
                $pdf->Cell(20, 8, utf8_decode('Pos.'), 1, 0, 'C', true);
                $pdf->Cell(60, 8, 'Agente', 1, 0, 'C', true);
                $pdf->Cell(35, 8, utf8_decode('Teléfono'), 1, 0, 'C', true);
                $pdf->Cell(60, 8, 'Instancia', 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Enviados', 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Recibidos', 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Total', 1, 1, 'C', true);

                $pdf->SetFont('Arial','',9);
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetFillColor(245, 245, 245);

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                $posicion = 0;
                $totalEnviados = 0;
                $totalRecibidos = 0;
                $totalMensajes = 0;
                $fill = false;

                if ($result = mysqli_query($this->Connection, $querySelect)) {
                    while($r = $result->fetch_array(MYSQLI_ASSOC)){
                        $posicion++;

                        // Medallas para top 3
                        $posLabel = $posicion;
                        if ($posicion <= 3) {
                            $pdf->SetFont('Arial','B',9);
                        } else {
                            $pdf->SetFont('Arial','',9);
                        }

                        $pdf->Cell(20, 7, $posLabel, 1, 0, 'C', $fill);
                        $pdf->Cell(60, 7, utf8_decode(substr($r['nombre'], 0, 30)), 1, 0, 'L', $fill);
                        $pdf->Cell(35, 7, $r['telefono'], 1, 0, 'C', $fill);
                        $pdf->Cell(60, 7, utf8_decode(substr($r['instancia'], 0, 30)), 1, 0, 'L', $fill);
                        $pdf->Cell(30, 7, $r['enviados'], 1, 0, 'C', $fill);
                        $pdf->Cell(30, 7, $r['recibidos'], 1, 0, 'C', $fill);
                        $pdf->Cell(30, 7, $r['totalMensajes'], 1, 1, 'C', $fill);

                        $totalEnviados += intval($r['enviados']);
                        $totalRecibidos += intval($r['recibidos']);
                        $totalMensajes += intval($r['totalMensajes']);
                        $fill = !$fill;
                    }
                }
                $this->closet();

                // Fila de totales
                $pdf->SetFont('Arial','B',10);
                $pdf->SetFillColor(200, 200, 200);
                $pdf->Cell(20, 8, '', 1, 0, 'C', true);
                $pdf->Cell(60, 8, 'TOTALES', 1, 0, 'C', true);
                $pdf->Cell(35, 8, '', 1, 0, 'C', true);
                $pdf->Cell(60, 8, '', 1, 0, 'C', true);
                $pdf->Cell(30, 8, $totalEnviados, 1, 0, 'C', true);
                $pdf->Cell(30, 8, $totalRecibidos, 1, 0, 'C', true);
                $pdf->Cell(30, 8, $totalMensajes, 1, 1, 'C', true);

                // Guardar PDF
                $nombre = 'REPORTE_AGENTES_'.date("Ymdhis").'.pdf';
                $tempPath = '../../../../temp/';

                // Crear directorio si no existe
                if (!is_dir($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $pdf->Output('F', $tempPath.$nombre);

                $SERVER = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
                header('Location: '.$SERVER.'/temp/'.$nombre);
                exit;
            }
        /*</EXPORTAR PDF AGENTES>*/

        // ============================================================================
        // REPORTES DE MENSAJES POR INSTANCIAS
        // ============================================================================

        /*<REPORTE MENSAJES POR INSTANCIA>*/
            public function reporteMensajesInstancias($fechaInicio, $fechaFin, $idCliente){
                /*<Variables>*/
                    $JSON_RESULT                            = [];
                    $JSON_RESULT['information']             = [];
                    $JSON_RESULT['message']                 = '';
                    $JSON_RESULT['error']                   = '';
                    $JSON_RESULT['totalMensajes']           = 0;
                    $JSON_RESULT['totalInstancias']         = 0;
                    $JSON_RESULT['instanciaTopNombre']      = '';
                    $JSON_RESULT['instanciaTopMensajes']    = 0;
                /*</Variables>*/

                /*<Query - Reporte agrupado por instancia>*/
                    $querySelect = "SELECT
                                        i.idInstancia,
                                        i.nombre,
                                        i.telefono,
                                        i.estatus as estado,
                                        COUNT(DISTINCT l.idLF) as totalMensajes,
                                        SUM(CASE WHEN l.tipoRespuesta = 'ENVIADO' OR l.tipoRespuesta = 'BOT' THEN 1 ELSE 0 END) as enviados,
                                        SUM(CASE WHEN l.tipoRespuesta = 'RECIBIDO' OR l.tipoRespuesta = 'CLIENTE' THEN 1 ELSE 0 END) as recibidos,
                                        (SELECT COUNT(*) FROM agentes a WHERE a.idCliente = i.idCliente AND a.bstate = 1) as agentesActivos
                                    FROM instancia i
                                    LEFT JOIN logs_view l ON i.idCliente = l.idCliente
                                        AND DATE(l.fechaCreacion) >= '".$fechaInicio."'
                                        AND DATE(l.fechaCreacion) <= '".$fechaFin."'
                                        AND l.bstate = 1
                                    WHERE
                                        i.idCliente = ".$idCliente." AND
                                        i.bstate = 1
                                    GROUP BY i.idInstancia, i.nombre, i.telefono, i.estatus
                                    ORDER BY totalMensajes DESC";
                /*</Query>*/

                $JSON_RESULT['querySelect'] = $querySelect;

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                    $totalMensajes = 0;
                    $posicion = 0;
                    $instancias = [];

                    if ($resultQuery->num_rows > 0) {
                        while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                            $posicion++;
                            $row['posicion'] = $posicion;
                            $row['totalMensajes'] = intval($row['totalMensajes']);
                            $row['enviados'] = intval($row['enviados']);
                            $row['recibidos'] = intval($row['recibidos']);
                            $row['agentesActivos'] = intval($row['agentesActivos']);
                            $totalMensajes += $row['totalMensajes'];
                            array_push($instancias, $row);
                        }
                    }

                    // Calcular porcentaje para cada instancia
                    foreach ($instancias as &$instancia) {
                        $instancia['porcentaje'] = $totalMensajes > 0
                            ? round(($instancia['totalMensajes'] / $totalMensajes) * 100, 1)
                            : 0;
                    }

                    $JSON_RESULT['information'] = $instancias;
                    $JSON_RESULT['totalMensajes'] = $totalMensajes;
                    $JSON_RESULT['totalInstancias'] = count($instancias);

                    // Instancia top
                    if (count($instancias) > 0) {
                        $JSON_RESULT['instanciaTopNombre'] = $instancias[0]['nombre'];
                        $JSON_RESULT['instanciaTopMensajes'] = $instancias[0]['totalMensajes'];
                    }

                    $JSON_RESULT['message'] = "Good";
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }

                $this->closet();
                return $JSON_RESULT;
            }
        /*</REPORTE MENSAJES POR INSTANCIA>*/

        /*<EXPORTAR EXCEL INSTANCIAS>*/
            public function exportarExcelInstancias($fechaInicio, $fechaFin, $idCliente){
                $JSON_RESULT = [];
                $JSON_RESULT['message'] = '';
                $JSON_RESULT['error'] = '';

                $querySelect = "SELECT
                                    i.idInstancia,
                                    i.nombre,
                                    i.telefono,
                                    i.estatus as estado,
                                    COUNT(DISTINCT l.idLF) as totalMensajes,
                                    SUM(CASE WHEN l.tipoRespuesta = 'ENVIADO' OR l.tipoRespuesta = 'BOT' THEN 1 ELSE 0 END) as enviados,
                                    SUM(CASE WHEN l.tipoRespuesta = 'RECIBIDO' OR l.tipoRespuesta = 'CLIENTE' THEN 1 ELSE 0 END) as recibidos,
                                    (SELECT COUNT(*) FROM agentes a WHERE a.idCliente = i.idCliente AND a.bstate = 1) as agentesActivos
                                FROM instancia i
                                LEFT JOIN logs_view l ON i.idCliente = l.idCliente
                                    AND DATE(l.fechaCreacion) >= '".$fechaInicio."'
                                    AND DATE(l.fechaCreacion) <= '".$fechaFin."'
                                    AND l.bstate = 1
                                WHERE
                                    i.idCliente = ".$idCliente." AND
                                    i.bstate = 1
                                GROUP BY i.idInstancia, i.nombre, i.telefono, i.estatus
                                ORDER BY totalMensajes DESC";

                $spreadsheet = new Spreadsheet();
                $nombre = 'REPORTE_INSTANCIAS_'.date("Ymdhis");
                $tempPath = '../../../../temp/';

                if (!is_dir($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                if ($result = mysqli_query($this->Connection, $querySelect)) {
                    $sheet = $spreadsheet->getActiveSheet();

                    // Titulo
                    $sheet->setCellValue('A1', 'Reporte de Instancias con Mas Mensajes');
                    $sheet->mergeCells('A1:H1');
                    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                    $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    // Subtitulo con fechas
                    $sheet->setCellValue('A2', 'Periodo: '.$fechaInicio.' al '.$fechaFin);
                    $sheet->mergeCells('A2:H2');
                    $sheet->getStyle('A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    // Encabezados
                    $sheet->setCellValue('A4', 'Posicion');
                    $sheet->setCellValue('B4', 'Instancia');
                    $sheet->setCellValue('C4', 'Telefono');
                    $sheet->setCellValue('D4', 'Estado');
                    $sheet->setCellValue('E4', 'Agentes');
                    $sheet->setCellValue('F4', 'Enviados');
                    $sheet->setCellValue('G4', 'Recibidos');
                    $sheet->setCellValue('H4', 'Total');

                    // Estilo encabezados
                    $sheet->getStyle('A4:H4')->getFont()->setBold(true);
                    $sheet->getStyle('A4:H4')->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('25D366');
                    $sheet->getStyle('A4:H4')->getFont()->getColor()->setRGB('FFFFFF');

                    $i = 5;
                    $posicion = 0;
                    $totalEnviados = 0;
                    $totalRecibidos = 0;
                    $totalMensajes = 0;

                    while($r = $result->fetch_array(MYSQLI_ASSOC)){
                        $posicion++;

                        $sheet->setCellValue('A'.$i, $posicion);
                        $sheet->setCellValue('B'.$i, $r['nombre']);
                        $sheet->setCellValue('C'.$i, $r['telefono']);
                        $sheet->setCellValue('D'.$i, $r['estado']);
                        $sheet->setCellValue('E'.$i, intval($r['agentesActivos']));
                        $sheet->setCellValue('F'.$i, intval($r['enviados']));
                        $sheet->setCellValue('G'.$i, intval($r['recibidos']));
                        $sheet->setCellValue('H'.$i, intval($r['totalMensajes']));

                        $totalEnviados += intval($r['enviados']);
                        $totalRecibidos += intval($r['recibidos']);
                        $totalMensajes += intval($r['totalMensajes']);
                        $i++;
                    }

                    // Fila de totales
                    $sheet->setCellValue('A'.$i, 'TOTALES');
                    $sheet->setCellValue('F'.$i, $totalEnviados);
                    $sheet->setCellValue('G'.$i, $totalRecibidos);
                    $sheet->setCellValue('H'.$i, $totalMensajes);
                    $sheet->getStyle('A'.$i.':H'.$i)->getFont()->setBold(true);
                    $sheet->getStyle('A'.$i.':H'.$i)->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('E8E8E8');

                    // Ajustar ancho de columnas
                    foreach(range('A','H') as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }

                    $writer = new Xlsx($spreadsheet);
                    $writer->save($tempPath.$nombre.'.xlsx');

                    $SERVER = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
                    $JSON_RESULT['message'] = 'Good';
                    $JSON_RESULT['URL'] = $SERVER.'/temp/'.$nombre.'.xlsx';
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                    $JSON_RESULT['error'] = mysqli_error($this->Connection);
                }

                $this->closet();
                return $JSON_RESULT;
            }
        /*</EXPORTAR EXCEL INSTANCIAS>*/

        /*<EXPORTAR PDF INSTANCIAS>*/
            public function exportarPDFInstancias($fechaInicio, $fechaFin, $idCliente){
                $querySelect = "SELECT
                                    i.idInstancia,
                                    i.nombre,
                                    i.telefono,
                                    i.estatus as estado,
                                    COUNT(DISTINCT l.idLF) as totalMensajes,
                                    SUM(CASE WHEN l.tipoRespuesta = 'ENVIADO' OR l.tipoRespuesta = 'BOT' THEN 1 ELSE 0 END) as enviados,
                                    SUM(CASE WHEN l.tipoRespuesta = 'RECIBIDO' OR l.tipoRespuesta = 'CLIENTE' THEN 1 ELSE 0 END) as recibidos,
                                    (SELECT COUNT(*) FROM agentes a WHERE a.idCliente = i.idCliente AND a.bstate = 1) as agentesActivos
                                FROM instancia i
                                LEFT JOIN logs_view l ON i.idCliente = l.idCliente
                                    AND DATE(l.fechaCreacion) >= '".$fechaInicio."'
                                    AND DATE(l.fechaCreacion) <= '".$fechaFin."'
                                    AND l.bstate = 1
                                WHERE
                                    i.idCliente = ".$idCliente." AND
                                    i.bstate = 1
                                GROUP BY i.idInstancia, i.nombre, i.telefono, i.estatus
                                ORDER BY totalMensajes DESC";

                $pdf = new \FPDF('L','mm','A4');
                $pdf->AddPage();

                // Titulo
                $pdf->SetFont('Arial','B',16);
                $pdf->SetTextColor(37, 211, 102);
                $pdf->Cell(0, 10, utf8_decode('Reporte de Instancias con Más Mensajes'), 0, 1, 'C');

                // Subtitulo
                $pdf->SetFont('Arial','',10);
                $pdf->SetTextColor(100, 100, 100);
                $pdf->Cell(0, 6, utf8_decode('Periodo: '.$fechaInicio.' al '.$fechaFin), 0, 1, 'C');
                $pdf->Ln(5);

                // Encabezados de tabla
                $pdf->SetFillColor(37, 211, 102);
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont('Arial','B',9);
                $pdf->Cell(15, 8, 'Pos.', 1, 0, 'C', true);
                $pdf->Cell(50, 8, 'Instancia', 1, 0, 'C', true);
                $pdf->Cell(35, 8, utf8_decode('Teléfono'), 1, 0, 'C', true);
                $pdf->Cell(30, 8, 'Estado', 1, 0, 'C', true);
                $pdf->Cell(25, 8, 'Agentes', 1, 0, 'C', true);
                $pdf->Cell(35, 8, 'Enviados', 1, 0, 'C', true);
                $pdf->Cell(35, 8, 'Recibidos', 1, 0, 'C', true);
                $pdf->Cell(35, 8, 'Total', 1, 1, 'C', true);

                $pdf->SetFont('Arial','',8);
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetFillColor(245, 245, 245);

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                $posicion = 0;
                $totalEnviados = 0;
                $totalRecibidos = 0;
                $totalMensajes = 0;
                $fill = false;

                if ($result = mysqli_query($this->Connection, $querySelect)) {
                    while($r = $result->fetch_array(MYSQLI_ASSOC)){
                        $posicion++;

                        if ($posicion <= 3) {
                            $pdf->SetFont('Arial','B',8);
                        } else {
                            $pdf->SetFont('Arial','',8);
                        }

                        $pdf->Cell(15, 7, $posicion, 1, 0, 'C', $fill);
                        $pdf->Cell(50, 7, utf8_decode(substr($r['nombre'], 0, 25)), 1, 0, 'L', $fill);
                        $pdf->Cell(35, 7, $r['telefono'], 1, 0, 'C', $fill);
                        $pdf->Cell(30, 7, $r['estado'], 1, 0, 'C', $fill);
                        $pdf->Cell(25, 7, $r['agentesActivos'], 1, 0, 'C', $fill);
                        $pdf->Cell(35, 7, $r['enviados'], 1, 0, 'C', $fill);
                        $pdf->Cell(35, 7, $r['recibidos'], 1, 0, 'C', $fill);
                        $pdf->Cell(35, 7, $r['totalMensajes'], 1, 1, 'C', $fill);

                        $totalEnviados += intval($r['enviados']);
                        $totalRecibidos += intval($r['recibidos']);
                        $totalMensajes += intval($r['totalMensajes']);
                        $fill = !$fill;
                    }
                }
                $this->closet();

                // Fila de totales
                $pdf->SetFont('Arial','B',9);
                $pdf->SetFillColor(200, 200, 200);
                $pdf->Cell(15, 8, '', 1, 0, 'C', true);
                $pdf->Cell(50, 8, 'TOTALES', 1, 0, 'C', true);
                $pdf->Cell(35, 8, '', 1, 0, 'C', true);
                $pdf->Cell(30, 8, '', 1, 0, 'C', true);
                $pdf->Cell(25, 8, '', 1, 0, 'C', true);
                $pdf->Cell(35, 8, $totalEnviados, 1, 0, 'C', true);
                $pdf->Cell(35, 8, $totalRecibidos, 1, 0, 'C', true);
                $pdf->Cell(35, 8, $totalMensajes, 1, 1, 'C', true);

                // Guardar PDF
                $nombre = 'REPORTE_INSTANCIAS_'.date("Ymdhis").'.pdf';
                $tempPath = '../../../../temp/';

                if (!is_dir($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $pdf->Output('F', $tempPath.$nombre);

                $SERVER = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
                header('Location: '.$SERVER.'/temp/'.$nombre);
                exit;
            }
        /*</EXPORTAR PDF INSTANCIAS>*/

    }
