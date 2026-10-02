<?php

namespace administrador\Modules\ModuleClienteDashboard\Model\dashboard;

    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as Conection;
    /*<use>*/

    class dashboard extends Conection {

        /*<Method construc>*/
            public function __construct(){
                parent::__construct();
            }
        /*<Method construc>*/

        /*<GET DASHBOARD STATS>*/
            public function getDashboardStats($idCliente){
                /*<Variables>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables>*/

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                // Fecha inicio del mes actual
                $fechaInicioMes = date('Y-m-01');
                $fechaHoy = date('Y-m-d');

                // 1. Mensajes enviados este mes
                $queryEnviados = "SELECT COUNT(*) as total FROM logs_view
                                  WHERE idCliente = $idCliente
                                  AND (tipoRespuesta = 'ENVIADO' OR tipoRespuesta = 'BOT')
                                  AND DATE(fechaCreacion) >= '$fechaInicioMes'
                                  AND bstate = 1";
                $resultEnviados = mysqli_query($this->Connection, $queryEnviados);
                $mensajesEnviados = 0;
                if ($resultEnviados && $row = $resultEnviados->fetch_assoc()) {
                    $mensajesEnviados = intval($row['total']);
                }

                // 2. Mensajes recibidos este mes
                $queryRecibidos = "SELECT COUNT(*) as total FROM logs_view
                                   WHERE idCliente = $idCliente
                                   AND (tipoRespuesta = 'RECIBIDO' OR tipoRespuesta = 'CLIENTE')
                                   AND DATE(fechaCreacion) >= '$fechaInicioMes'
                                   AND bstate = 1";
                $resultRecibidos = mysqli_query($this->Connection, $queryRecibidos);
                $mensajesRecibidos = 0;
                if ($resultRecibidos && $row = $resultRecibidos->fetch_assoc()) {
                    $mensajesRecibidos = intval($row['total']);
                }

                // 3. Contactos activos
                $queryContactos = "SELECT COUNT(*) as total FROM contactos
                                   WHERE idCliente = $idCliente AND bstate = 1";
                $resultContactos = mysqli_query($this->Connection, $queryContactos);
                $contactosActivos = 0;
                if ($resultContactos && $row = $resultContactos->fetch_assoc()) {
                    $contactosActivos = intval($row['total']);
                }

                // 4. Agentes activos
                $queryAgentes = "SELECT COUNT(*) as total FROM agentes
                                 WHERE idCliente = $idCliente AND bstate = 1";
                $resultAgentes = mysqli_query($this->Connection, $queryAgentes);
                $agentesActivos = 0;
                if ($resultAgentes && $row = $resultAgentes->fetch_assoc()) {
                    $agentesActivos = intval($row['total']);
                }

                // 5. Instancias conectadas y totales
                $queryInstanciasConectadas = "SELECT COUNT(*) as total FROM instancia
                                              WHERE idCliente = $idCliente
                                              AND estatus = 'ACTIVO' AND bstate = 1";
                $resultInstConectadas = mysqli_query($this->Connection, $queryInstanciasConectadas);
                $instanciasConectadas = 0;
                if ($resultInstConectadas && $row = $resultInstConectadas->fetch_assoc()) {
                    $instanciasConectadas = intval($row['total']);
                }

                $queryInstanciasTotales = "SELECT COUNT(*) as total FROM instancia
                                           WHERE idCliente = $idCliente AND bstate = 1";
                $resultInstTotales = mysqli_query($this->Connection, $queryInstanciasTotales);
                $instanciasTotales = 0;
                if ($resultInstTotales && $row = $resultInstTotales->fetch_assoc()) {
                    $instanciasTotales = intval($row['total']);
                }

                // 6. Bots activos (flujos activos)
                $queryBots = "SELECT COUNT(*) as total FROM flujos
                              WHERE idCliente = $idCliente AND estatus = 'ACTIVO' AND bstate = 1";
                $resultBots = mysqli_query($this->Connection, $queryBots);
                $botsActivos = 0;
                if ($resultBots && $row = $resultBots->fetch_assoc()) {
                    $botsActivos = intval($row['total']);
                }

                // 7. Plan actual
                $queryPlan = "SELECT
                                p.nombre,
                                m.fechaInicio,
                                m.fechaFin,
                                m.estatus as estatusMembresia,
                                p.vinculaciones as limiteMensajes
                              FROM membresia m
                              INNER JOIN cat_planes p ON m.idPlan = p.idPlan
                              WHERE m.idUsuario = $idCliente
                              AND m.estatus = 'ACTIVO'
                              AND m.bstate = 1
                              ORDER BY m.fechaFin DESC
                              LIMIT 1";
                $resultPlan = mysqli_query($this->Connection, $queryPlan);
                $planActual = null;

                if ($resultPlan && $row = $resultPlan->fetch_assoc()) {
                    $fechaFin = new \DateTime($row['fechaFin']);
                    $hoy = new \DateTime();
                    $diasRestantes = $hoy->diff($fechaFin)->days;
                    if ($fechaFin < $hoy) {
                        $diasRestantes = 0;
                    }

                    // Calcular porcentaje usado (mensajes usados / limite)
                    $limiteMensajes = intval($row['limiteMensajes']);
                    $mensajesTotales = $mensajesEnviados + $mensajesRecibidos;
                    $porcentajeUsado = $limiteMensajes > 0
                        ? round(($mensajesTotales / $limiteMensajes) * 100, 1)
                        : 0;
                    if ($porcentajeUsado > 100) $porcentajeUsado = 100;

                    $planActual = [
                        'nombre' => $row['nombre'],
                        'diasRestantes' => $diasRestantes,
                        'porcentajeUsado' => $porcentajeUsado
                    ];
                }

                $this->closet();

                // Construir respuesta
                $JSON_RESULT['information'] = [
                    'mensajesEnviados' => $mensajesEnviados,
                    'mensajesRecibidos' => $mensajesRecibidos,
                    'contactosActivos' => $contactosActivos,
                    'agentesActivos' => $agentesActivos,
                    'instanciasConectadas' => $instanciasConectadas,
                    'instanciasTotales' => $instanciasTotales,
                    'botsActivos' => $botsActivos,
                    'planActual' => $planActual
                ];
                $JSON_RESULT['message'] = 'Good';

                return $JSON_RESULT;
            }
        /*</GET DASHBOARD STATS>*/

    }
