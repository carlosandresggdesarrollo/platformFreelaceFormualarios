<?php

namespace administrador\Modules\ModuleAdminDashboard\Model\dashboard;

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

        /*<GET ADMIN DASHBOARD STATS>*/
            public function getAdminDashboardStats($anioSeleccionado = null){
                /*<Variables>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables>*/

                $this->open();
                mysqli_set_charset($this->Connection, "utf8");

                // Si no se proporciona año, usar el actual
                $anioActual = intval(date('Y'));
                $anioFiltro = ($anioSeleccionado !== null) ? intval($anioSeleccionado) : $anioActual;

                $fechaInicioAnio = $anioFiltro . '-01-01';
                $fechaFinAnio = $anioFiltro . '-12-31';

                // Para datos del mes actual (solo si es el año actual)
                $mesActual = ($anioFiltro == $anioActual) ? date('m') : '12';
                $fechaInicioMes = $anioFiltro . '-' . $mesActual . '-01';

                // 1. Total de clientes activos (global, no depende del año)
                $queryClientes = "SELECT COUNT(*) as total FROM usuarios
                                  WHERE tipoUsuario = 'CLIENTE'
                                  AND estatus = 'ACTIVO' AND bstate = 1";
                $resultClientes = mysqli_query($this->Connection, $queryClientes);
                $clientesActivos = 0;
                if ($resultClientes && $row = $resultClientes->fetch_assoc()) {
                    $clientesActivos = intval($row['total']);
                }

                // 2. Nuevos clientes en el año seleccionado
                $queryNuevosClientes = "SELECT COUNT(*) as total FROM usuarios
                                        WHERE tipoUsuario = 'CLIENTE'
                                        AND YEAR(fechaCreacion) = $anioFiltro
                                        AND bstate = 1";
                $resultNuevos = mysqli_query($this->Connection, $queryNuevosClientes);
                $nuevosClientesAnio = 0;
                if ($resultNuevos && $row = $resultNuevos->fetch_assoc()) {
                    $nuevosClientesAnio = intval($row['total']);
                }

                // 3. Total mensajes (campana_detalle) del año seleccionado
                $queryMensajes = "SELECT COUNT(*) as total
                                  FROM campana_detalle cd
                                  INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                                  WHERE YEAR(cd.fechaCreacion) = $anioFiltro
                                  AND cd.bstate = 1";
                $resultMensajes = mysqli_query($this->Connection, $queryMensajes);
                $mensajesTotales = 0;
                if ($resultMensajes && $row = $resultMensajes->fetch_assoc()) {
                    $mensajesTotales = intval($row['total']);
                }

                // 4. Total instancias activas (global)
                $queryInstancias = "SELECT COUNT(*) as total FROM instancia
                                    WHERE estatus = 'ACTIVO' AND bstate = 1";
                $resultInstancias = mysqli_query($this->Connection, $queryInstancias);
                $instanciasActivas = 0;
                if ($resultInstancias && $row = $resultInstancias->fetch_assoc()) {
                    $instanciasActivas = intval($row['total']);
                }

                // 5. Ingresos del año seleccionado
                $queryIngresosAnio = "SELECT COALESCE(SUM(f.costo), 0) as total
                                      FROM facturacion f
                                      WHERE f.estatus = 'PAGADO'
                                      AND YEAR(f.fechaPago) = $anioFiltro
                                      AND f.bstate = 1";
                $resultIngresosAnio = mysqli_query($this->Connection, $queryIngresosAnio);
                $ingresosAnio = 0;
                if ($resultIngresosAnio && $row = $resultIngresosAnio->fetch_assoc()) {
                    $ingresosAnio = floatval($row['total']);
                }

                // 6. Facturas pendientes (global)
                $queryPendientes = "SELECT COUNT(*) as total, COALESCE(SUM(costo), 0) as monto
                                    FROM facturacion
                                    WHERE estatus = 'PENDIENTE' AND bstate = 1";
                $resultPendientes = mysqli_query($this->Connection, $queryPendientes);
                $facturasPendientes = 0;
                $montoPendiente = 0;
                if ($resultPendientes && $row = $resultPendientes->fetch_assoc()) {
                    $facturasPendientes = intval($row['total']);
                    $montoPendiente = floatval($row['monto']);
                }

                // 7. Membresías por plan del año seleccionado (para gráfica de pie)
                $queryMembresias = "SELECT p.nombre as label, COUNT(*) as value
                                    FROM facturacion f
                                    INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                                    INNER JOIN cat_planes p ON p.idPlan = m.idPlan AND p.bstate = 1
                                    WHERE f.estatus = 'PAGADO' AND f.bstate = 1
                                    AND YEAR(f.fechaPago) = $anioFiltro
                                    GROUP BY p.idPlan, p.nombre
                                    ORDER BY value DESC";
                $resultMembresias = mysqli_query($this->Connection, $queryMembresias);
                $membresiasPorPlan = [];
                if ($resultMembresias) {
                    while ($row = $resultMembresias->fetch_assoc()) {
                        $membresiasPorPlan[] = [
                            'label' => $row['label'],
                            'value' => intval($row['value'])
                        ];
                    }
                }

                // 8. Top 5 clientes con más compras en el año seleccionado
                $queryTopClientes = "SELECT
                                        u.idUsuario as idCliente,
                                        CONCAT(IFNULL(u.nombre, ''), ' ', IFNULL(u.apellidos, '')) as nombre,
                                        IFNULL(u.usuario, '') as email,
                                        IFNULL((
                                            SELECT p2.nombre
                                            FROM facturacion f2
                                            INNER JOIN membresia m2 ON m2.idMembresia = f2.idMembresia
                                            INNER JOIN cat_planes p2 ON p2.idPlan = m2.idPlan
                                            WHERE m2.idUsuario = u.idUsuario
                                            AND f2.estatus = 'PAGADO' AND f2.bstate = 1
                                            AND YEAR(f2.fechaPago) = $anioFiltro
                                            ORDER BY f2.fechaPago DESC LIMIT 1
                                        ), 'Sin plan') as plan,
                                        IFNULL((
                                            SELECT COUNT(*)
                                            FROM facturacion f3
                                            INNER JOIN membresia m3 ON m3.idMembresia = f3.idMembresia
                                            WHERE m3.idUsuario = u.idUsuario
                                            AND f3.estatus = 'PAGADO' AND f3.bstate = 1
                                            AND YEAR(f3.fechaPago) = $anioFiltro
                                        ), 0) as mensajes,
                                        IFNULL((
                                            SELECT SUM(f4.costo)
                                            FROM facturacion f4
                                            INNER JOIN membresia m4 ON m4.idMembresia = f4.idMembresia
                                            WHERE m4.idUsuario = u.idUsuario
                                            AND f4.estatus = 'PAGADO' AND f4.bstate = 1
                                            AND YEAR(f4.fechaPago) = $anioFiltro
                                        ), 0) as totalCompras
                                     FROM usuarios u
                                     WHERE u.tipoUsuario = 'CLIENTE' AND u.bstate = 1
                                     HAVING totalCompras > 0
                                     ORDER BY totalCompras DESC
                                     LIMIT 5";
                $resultTop = mysqli_query($this->Connection, $queryTopClientes);
                $topClientes = [];
                if ($resultTop) {
                    while ($row = $resultTop->fetch_assoc()) {
                        $topClientes[] = [
                            'idCliente' => intval($row['idCliente']),
                            'nombre' => trim($row['nombre']),
                            'email' => $row['email'],
                            'plan' => $row['plan'],
                            'mensajes' => intval($row['mensajes']),
                            'totalCompras' => floatval($row['totalCompras'])
                        ];
                    }
                }

                // 9. Mensajes por día (últimos 7 días) - solo si es año actual
                $mensajesPorDia = [];
                if ($anioFiltro == $anioActual) {
                    $queryMensajesDia = "SELECT DATE(cd.fechaCreacion) as fecha, COUNT(*) as mensajes
                                         FROM campana_detalle cd
                                         INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                                         WHERE DATE(cd.fechaCreacion) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                                         AND cd.bstate = 1
                                         GROUP BY DATE(cd.fechaCreacion)
                                         ORDER BY fecha ASC";
                    $resultMensajesDia = mysqli_query($this->Connection, $queryMensajesDia);
                    if ($resultMensajesDia) {
                        while ($row = $resultMensajesDia->fetch_assoc()) {
                            $mensajesPorDia[] = [
                                'fecha' => $row['fecha'],
                                'mensajes' => intval($row['mensajes'])
                            ];
                        }
                    }
                }

                // 10. Total de planes disponibles (global)
                $queryPlanes = "SELECT COUNT(*) as total FROM cat_planes WHERE bstate = 1";
                $resultPlanes = mysqli_query($this->Connection, $queryPlanes);
                $totalPlanes = 0;
                if ($resultPlanes && $row = $resultPlanes->fetch_assoc()) {
                    $totalPlanes = intval($row['total']);
                }

                // 11. Planes más vendidos del año seleccionado
                $queryPlanesAnio = "SELECT
                                        p.nombre as nombrePlan,
                                        COUNT(*) as cantidadVendida,
                                        SUM(f.costo) as totalVentas
                                    FROM facturacion f
                                    INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                                    INNER JOIN cat_planes p ON p.idPlan = m.idPlan AND p.bstate = 1
                                    WHERE f.estatus = 'PAGADO'
                                    AND YEAR(f.fechaPago) = $anioFiltro
                                    AND f.bstate = 1
                                    GROUP BY p.idPlan, p.nombre
                                    ORDER BY cantidadVendida DESC
                                    LIMIT 5";
                $resultPlanesAnio = mysqli_query($this->Connection, $queryPlanesAnio);
                $planesMasVendidosAnio = [];
                if ($resultPlanesAnio) {
                    while ($row = $resultPlanesAnio->fetch_assoc()) {
                        $planesMasVendidosAnio[] = [
                            'nombrePlan' => $row['nombrePlan'],
                            'cantidadVendida' => intval($row['cantidadVendida']),
                            'totalVentas' => floatval($row['totalVentas'])
                        ];
                    }
                }

                // 12. Ventas por mes del año seleccionado (para gráfica de barras)
                $queryVentasPorMes = "SELECT
                                        MONTH(f.fechaPago) as mes,
                                        MONTHNAME(f.fechaPago) as nombreMes,
                                        COUNT(*) as cantidadVentas,
                                        SUM(f.costo) as totalVentas
                                      FROM facturacion f
                                      WHERE f.estatus = 'PAGADO'
                                      AND YEAR(f.fechaPago) = $anioFiltro
                                      AND f.bstate = 1
                                      GROUP BY MONTH(f.fechaPago), MONTHNAME(f.fechaPago)
                                      ORDER BY mes ASC";
                $resultVentasPorMes = mysqli_query($this->Connection, $queryVentasPorMes);
                $ventasPorMes = [];
                $mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                // Inicializar todos los meses con 0
                for ($i = 1; $i <= 12; $i++) {
                    $ventasPorMes[$i] = [
                        'mes' => $i,
                        'nombreMes' => $mesesNombres[$i-1],
                        'cantidadVentas' => 0,
                        'totalVentas' => 0
                    ];
                }
                if ($resultVentasPorMes) {
                    while ($row = $resultVentasPorMes->fetch_assoc()) {
                        $mes = intval($row['mes']);
                        $ventasPorMes[$mes] = [
                            'mes' => $mes,
                            'nombreMes' => $mesesNombres[$mes-1],
                            'cantidadVentas' => intval($row['cantidadVentas']),
                            'totalVentas' => floatval($row['totalVentas'])
                        ];
                    }
                }
                $ventasPorMes = array_values($ventasPorMes);

                // 13. Total ventas realizadas del año seleccionado
                $queryTotalVentas = "SELECT COUNT(*) as total
                                     FROM facturacion
                                     WHERE estatus = 'PAGADO'
                                     AND YEAR(fechaPago) = $anioFiltro
                                     AND bstate = 1";
                $resultTotalVentas = mysqli_query($this->Connection, $queryTotalVentas);
                $totalVentasRealizadas = 0;
                if ($resultTotalVentas && $row = $resultTotalVentas->fetch_assoc()) {
                    $totalVentasRealizadas = intval($row['total']);
                }

                // 14. Obtener años disponibles con ventas
                $queryAniosDisponibles = "SELECT DISTINCT YEAR(fechaPago) as anio
                                          FROM facturacion
                                          WHERE estatus = 'PAGADO' AND bstate = 1
                                          AND fechaPago IS NOT NULL
                                          ORDER BY anio DESC";
                $resultAnios = mysqli_query($this->Connection, $queryAniosDisponibles);
                $aniosDisponibles = [];
                if ($resultAnios) {
                    while ($row = $resultAnios->fetch_assoc()) {
                        $aniosDisponibles[] = intval($row['anio']);
                    }
                }
                // Si no hay años con ventas, agregar el año actual
                if (empty($aniosDisponibles)) {
                    $aniosDisponibles[] = $anioActual;
                }

                $this->closet();

                // Construir respuesta
                $JSON_RESULT['message'] = 'Good';
                $JSON_RESULT['clientesActivos'] = $clientesActivos;
                $JSON_RESULT['nuevosClientesAnio'] = $nuevosClientesAnio;
                $JSON_RESULT['mensajesTotales'] = $mensajesTotales;
                $JSON_RESULT['instanciasActivas'] = $instanciasActivas;
                $JSON_RESULT['ingresosAnio'] = $ingresosAnio;
                $JSON_RESULT['facturasPendientes'] = $facturasPendientes;
                $JSON_RESULT['montoPendiente'] = $montoPendiente;
                $JSON_RESULT['membresiasPorPlan'] = $membresiasPorPlan;
                $JSON_RESULT['topClientes'] = $topClientes;
                $JSON_RESULT['mensajesPorDia'] = $mensajesPorDia;
                $JSON_RESULT['totalPlanes'] = $totalPlanes;
                $JSON_RESULT['planesMasVendidosAnio'] = $planesMasVendidosAnio;
                $JSON_RESULT['ventasPorMes'] = $ventasPorMes;
                $JSON_RESULT['totalVentasRealizadas'] = $totalVentasRealizadas;
                $JSON_RESULT['anioSeleccionado'] = $anioFiltro;
                $JSON_RESULT['aniosDisponibles'] = $aniosDisponibles;

                return $JSON_RESULT;
            }
        /*</GET ADMIN DASHBOARD STATS>*/

    }
