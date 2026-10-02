<?php

namespace administrador\Modules\ModuleClienteConfiguracion\Model\configuracion;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as Conection;
    /*<use>*/

    class configuracion extends Conection{

        /*<Method construc>*/
            public function __construct(){
                // Construct Father
                parent::__construct();
            }
        /*<Method construc>*/

        /*<JSON_CONSULTA_PLANES_SMS>*/
            public function JSON_CONSULTA_PLANES_SMS($idUsuario){
                /*<Variables> */
                    $JSON_RESULT                        = [];
                    $JSON_RESULT['planes_pagados']      = [];
                    $JSON_RESULT['planes_pendientes']   = [];
                    $JSON_RESULT['resumen']             = [];
                    $JSON_RESULT['message']             = '';
                    $JSON_RESULT['error']               = '';
                /*</Variables> */

                /*<Query Planes Pagados> */
                    $queryPlanesPagados = "SELECT
                        f.idFacturacion,
                        f.idMembresia,
                        f.folio AS folioFactura,
                        f.fechaPago,
                        f.formaPago,
                        f.estatus AS estatusFactura,

                        -- Datos del usuario
                        m.idUsuario,
                        IFNULL(u.nombre, '') AS nombreUsuario,
                        IFNULL(u.apellidos, '') AS apellidoUsuario,
                        IFNULL(u.usuario, '') AS Usuario,

                        -- Datos del plan
                        m.idPlan,
                        IFNULL(p.nombre, 'Sin plan') AS nombrePlan,
                        IFNULL(p.mensajes, 0) AS mensajesEntrada,

                        -- Acumulado de mensajes contratados hasta esta factura (incluyéndola)
                        IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                            AND f2.bstate = 1
                            AND f2.estatus = 'PAGADO'
                            AND f2.fechaPago <= f.fechaPago
                        ), 0) AS mensajesAcumulados,

                        -- Acumulado de mensajes contratados ANTES de esta factura
                        IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                            AND f2.bstate = 1
                            AND f2.estatus = 'PAGADO'
                            AND f2.fechaPago < f.fechaPago
                        ), 0) AS mensajesAcumuladosAnterior,

                        -- Total de mensajes usados por el usuario
                        IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario
                            AND cd.bstate = 1
                        ), 0) AS totalMensajesUsados,

                        -- Mensajes salida (consumidos de ESTE plan específico)
                        CASE
                            -- Si el total usado es menor o igual al acumulado anterior, este plan no se ha tocado
                            WHEN IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) <= IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago < f.fechaPago
                            ), 0) THEN 0

                            -- Si el total usado supera el acumulado actual, este plan se consumió completo
                            WHEN IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) >= IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago <= f.fechaPago
                            ), 0) THEN IFNULL(p.mensajes, 0)

                            -- Si está en medio, calcular cuántos se usaron de este plan
                            ELSE IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) - IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago < f.fechaPago
                            ), 0)
                        END AS mensajesSalida,

                        -- Saldo de ESTE plan (entrada - salida)
                        IFNULL(p.mensajes, 0) - CASE
                            WHEN IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) <= IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago < f.fechaPago
                            ), 0) THEN 0
                            WHEN IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) >= IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago <= f.fechaPago
                            ), 0) THEN IFNULL(p.mensajes, 0)
                            ELSE IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) - IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago < f.fechaPago
                            ), 0)
                        END AS saldoPlan,

                        -- Saldo acumulado global
                        IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                            AND f2.bstate = 1
                            AND f2.estatus = 'PAGADO'
                            AND f2.fechaPago <= f.fechaPago
                        ), 0) - IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario
                            AND cd.bstate = 1
                        ), 0) AS saldoAcumulado,

                        -- Estatus del plan
                        CASE
                            WHEN IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) <= IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago < f.fechaPago
                            ), 0) THEN 'DISPONIBLE'
                            WHEN IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = m.idUsuario AND cd.bstate = 1
                            ), 0) >= IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f2
                            INNER JOIN membresia mem ON mem.idMembresia = f2.idMembresia AND mem.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = mem.idPlan AND cp.bstate = 1
                            WHERE mem.idUsuario = m.idUsuario
                                AND f2.bstate = 1
                                AND f2.estatus = 'PAGADO'
                                AND f2.fechaPago <= f.fechaPago
                            ), 0) THEN 'AGOTADO'
                            ELSE 'EN USO'
                        END AS estatusPlan,

                        f.fechaCreacion,
                        f.bstate
                        FROM facturacion f
                        INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                        LEFT JOIN usuarios u ON u.idUsuario = m.idUsuario AND u.bstate = 1
                        LEFT JOIN cat_planes p ON p.idPlan = m.idPlan AND p.bstate = 1
                        WHERE f.bstate = 1
                        AND f.estatus = 'PAGADO'
                        AND m.idUsuario = ".$idUsuario."
                        ORDER BY f.fechaPago ASC;";
                /*</Query> */

                $this->open();
                    if ($resultQuery = mysqli_query($this->Connection, $queryPlanesPagados)) {
                        if ($resultQuery->num_rows > 0) {
                            /*<Captura>*/
                                while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    array_push($JSON_RESULT['planes_pagados'], $row);
                                }
                            /*</Captura>*/
                        }
                        $JSON_RESULT['message'] = "Good";
                    } else {
                        $JSON_RESULT['message'] = "Bad";
                        $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                    }
                $this->closet();

                /*<Query Planes Pendientes> */
                    $queryPlanesPendientes = "SELECT
                        f.idFacturacion,
                        f.idMembresia,
                        f.folio AS folioFactura,
                        f.fecha,
                        f.fechaCorte,
                        f.estatus AS estatusFactura,
                        m.idUsuario,
                        m.idPlan,
                        IFNULL(p.nombre, 'Sin plan') AS nombrePlan,
                        IFNULL(p.mensajes, 0) AS mensajesEntrada,
                        IFNULL(p.costo, 0) AS costo,
                        IFNULL(p.vigencia, 0) AS vigencia,
                        IFNULL(p.unidad, '') AS unidad,
                        f.fechaCreacion,
                        f.bstate
                        FROM facturacion f
                        INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                        LEFT JOIN cat_planes p ON p.idPlan = m.idPlan AND p.bstate = 1
                        WHERE f.bstate = 1
                        AND f.estatus = 'PENDIENTE'
                        AND m.idUsuario = ".$idUsuario."
                        ORDER BY f.fechaCreacion DESC;";
                /*</Query> */

                $this->open();
                    if ($resultQuery = mysqli_query($this->Connection, $queryPlanesPendientes)) {
                        if ($resultQuery->num_rows > 0) {
                            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                array_push($JSON_RESULT['planes_pendientes'], $row);
                            }
                        }
                        $JSON_RESULT['message'] = "Good";
                    } else {
                        $JSON_RESULT['message'] = "Bad";
                        $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                    }
                $this->closet();

                /*<Query Resumen Global> */
                    $queryResumen = "SELECT
                        -- Total mensajes contratados (pagados)
                        IFNULL((
                            SELECT SUM(cp.mensajes)
                            FROM facturacion f
                            INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                            INNER JOIN cat_planes cp ON cp.idPlan = m.idPlan AND cp.bstate = 1
                            WHERE m.idUsuario = ".$idUsuario."
                            AND f.bstate = 1
                            AND f.estatus = 'PAGADO'
                        ), 0) AS totalMensajesContratados,

                        -- Total mensajes usados
                        IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = ".$idUsuario."
                            AND cd.bstate = 1
                        ), 0) AS totalMensajesUsados,

                        -- Mensajes pendientes (estatus PENDIENTE)
                        IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = ".$idUsuario."
                            AND cd.bstate = 1
                            AND cd.estatus = 'PENDIENTE'
                        ), 0) AS mensajesPendientes,

                        -- Mensajes procesados/enviados
                        IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = ".$idUsuario."
                            AND cd.bstate = 1
                            AND cd.estatus IN ('PROCESADO', 'ENVIADO', 'ENTREGADO')
                        ), 0) AS mensajesProcesados,

                        -- Mensajes fallidos
                        IFNULL((
                            SELECT COUNT(*)
                            FROM campana_detalle cd
                            INNER JOIN campana_encabezado ce ON ce.idCampana = cd.idCampana AND ce.bstate = 1
                            WHERE ce.idCliente = ".$idUsuario."
                            AND cd.bstate = 1
                            AND cd.estatus = 'FALLIDO'
                        ), 0) AS mensajesFallidos,

                        -- Total campañas
                        IFNULL((
                            SELECT COUNT(*)
                            FROM campana_encabezado ce
                            WHERE ce.idCliente = ".$idUsuario." AND ce.bstate = 1
                        ), 0) AS totalCampanas,

                        -- Total facturas pagadas
                        IFNULL((
                            SELECT COUNT(*)
                            FROM facturacion f
                            INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                            WHERE m.idUsuario = ".$idUsuario."
                            AND f.bstate = 1
                            AND f.estatus = 'PAGADO'
                        ), 0) AS totalFacturasPagadas,

                        -- Total facturas pendientes
                        IFNULL((
                            SELECT COUNT(*)
                            FROM facturacion f
                            INNER JOIN membresia m ON m.idMembresia = f.idMembresia AND m.bstate = 1
                            WHERE m.idUsuario = ".$idUsuario."
                            AND f.bstate = 1
                            AND f.estatus = 'PENDIENTE'
                        ), 0) AS totalFacturasPendientes;";
                /*</Query> */

                $this->open();
                    if ($resultQuery = mysqli_query($this->Connection, $queryResumen)) {
                        if ($resultQuery->num_rows > 0) {
                            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                $JSON_RESULT['resumen'] = $row;
                                // Calcular saldo disponible
                                $JSON_RESULT['resumen']['saldoDisponible'] =
                                    intval($row['totalMensajesContratados']) - intval($row['totalMensajesUsados']);
                                // Calcular estatus de saldo
                                if (intval($row['totalMensajesContratados']) == 0) {
                                    $JSON_RESULT['resumen']['estatusSaldo'] = 'SIN PLAN PAGADO';
                                } else if ($JSON_RESULT['resumen']['saldoDisponible'] <= 0) {
                                    $JSON_RESULT['resumen']['estatusSaldo'] = 'SALDO AGOTADO';
                                } else {
                                    $JSON_RESULT['resumen']['estatusSaldo'] = 'SALDO DISPONIBLE';
                                }
                            }
                        }
                        $JSON_RESULT['message'] = "Good";
                    } else {
                        $JSON_RESULT['message'] = "Bad";
                        $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                    }
                $this->closet();

                return $JSON_RESULT;
            }
        /*</JSON_CONSULTA_PLANES_SMS>*/
    }
