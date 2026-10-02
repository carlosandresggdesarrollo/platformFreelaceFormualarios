<?php

namespace administrador\Modules\Welcome\Model\estadisticas;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as ConectionEstadisticas;
    /*<use>*/

    class estadisticas  extends ConectionEstadisticas{

        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/
    
     
        /*<Method estadisticas>*/
            public function selectAgentesEstadisticas(){
                
                /*<Variables> */
                    $JSON_RESULT                                = [];
                    $JSON_RESULT['information']                 = [];
                    $JSON_RESULT['message']                     = '';
                    $JSON_RESULT['error']                       = '';

                    session_start();
                    $idUser                     = $_SESSION["administrador-idUsuario"];
                    $tipoUsuario                = $_SESSION["administrador-tipoUsuario"];
                /*</Variables> */

                if($tipoUsuario == 'ADMINISTRADOR'){
                   
                     /*<Query>*/
                        $querySelect = '    SELECT      agentes.nombre,
                                                        agentes.telefono,
                                                        (
                                                            SELECT  COUNT(*) 
                                                            FROM    mensajesAgente   mensajesAgente
                                                            WHERE  
                                                                  
                                                                    mensajesAgente.bstate          = 1                  AND                                                                            
                                                                    mensajesAgente.idAgente        = agentes.idAgente
                                                        ) AS total
                                                        FROM agentes_view   agentes
                                                                        WHERE  
                                                                               
                                                                                agentes.bstate          = 1  ';
                    /*<Query>*/

                  


                }else{
                    /*<Query>*/
                        $querySelect = '    SELECT      agentes.nombre,
                                                        agentes.telefono,
                                                        (
                                                            SELECT  COUNT(*) 
                                                            FROM    mensajesAgente   mensajesAgente
                                                            WHERE  
                                                                  
                                                                    mensajesAgente.bstate          = 1                  AND                                                                            
                                                                    mensajesAgente.idAgente        = agentes.idAgente
                                                        ) AS total
                                                        FROM agentes_view   agentes
                                                                        WHERE  
                                                                               
                                                                                agentes.bstate          = 1 AND                                                                            
                                                                                agentes.idCliente       = '.$idUser.'; ';
                    /*<Query>*/
                }
                
                    $JSON_RESULT['querySelect']           = $querySelect;

                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {                                        
                                        array_push($JSON_RESULT['information'], $Rol);
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['information']     = [];
                            }
                            /*<Respuesta>*/
                                $JSON_RESULT['message'] = "Good";   
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                           
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                /*</CONSULTA>*/

                return $JSON_RESULT;
            }
        /*<Method estadisticas>*/

        /*<Method estadisticas>*/
            public function selectAgentes(){
                
                /*<Variables> */
                    $JSON_RESULT                                = [];                    
                    $JSON_RESULT['agentes_view']                 = [];
                    $JSON_RESULT['message']                     = '';
                    $JSON_RESULT['error']                       = '';

                    session_start();
                    $idUser                     = $_SESSION["administrador-idUsuario"];
                    $tipoUsuario                = $_SESSION["administrador-tipoUsuario"];
                /*</Variables> */

                /*<USUARIOS>*/
                    if($tipoUsuario == 'ADMINISTRADOR'){
                        /*<Query> */
                            $querySelect = '    SELECT *  FROM  agentes_view 
                                                        WHERE           
                                                                bstate      = 1  ; ';
                        /*</Query> */
                    }else{
                        /*<Query> */
                            $querySelect = '    SELECT *  FROM  agentes_view 
                                                        WHERE           
                                                                bstate      = 1 AND 
                                                                idCliente   = '.$idUser.' ; ';
                        /*</Query> */
                    }
                    $JSON_RESULT['querySelect']     = $querySelect;

                    $this::open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                        array_push($JSON_RESULT['agentes_view'], $Rol);
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['agentes_view']     = [];
                            }
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Good";   
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                          
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this::closet();
                /*</USUARIOS>*/

                return $JSON_RESULT;
            }
        /*<Method estadisticas>*/

        /*<Method selectAgentesEstadisticasAdmin>*/
            public function selectAgentesEstadisticasAdmin(){
                /*<Variables> */
                    $JSON_RESULT                                = [];
                    $JSON_RESULT['information']                 = [];
                    $JSON_RESULT['cat_planes']                  = [];
                    $JSON_RESULT['message']                     = '';
                    $JSON_RESULT['error']                       = '';

                    /*<FECHA>*/
                        $MES_INICIO                 = date("Y-m-01");
                        $MES_ACTUALIDAD             = date("Y-m-d");
                        $MES_INICIO                 = $MES_INICIO.' 00:00:00';
                        $MES_ACTUALIDAD             = $MES_ACTUALIDAD.' 23:59:59';
                    /*<FECHA>*/
                /*</Variables> */

                /*<CONSULTA PLANES>*/
                    /*<Query>*/
                            $querySelect = '    SELECT  cat_planes.nombre,
                                                        cat_planes.costo,
                                                        (
                                                            SELECT  COUNT(*)  
                                                            FROM    cat_planes cp, membresia, facturacion  
                                                            WHERE            
                                                                    facturacion.idMembresia         = membresia.idMembresia     AND
                                                                    membresia.idPlan                = cp.idPlan                 AND   
                                                                    cp.idPlan                       = cat_planes.idPlan         AND                                                    
                                                                    cp.bstate                       = 1                         AND
                                                                    facturacion.fechaCreacion BETWEEN "'.$MES_INICIO.'" AND "'.$MES_ACTUALIDAD.'"
                                                        )as total
                                                         FROM cat_planes 
                                                         WHERE cat_planes.bstate = 1
                                                            
                                                         ';
                    /*<Query>*/

                
                    $JSON_RESULT['querySelect']           = $querySelect;

                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {                                        
                                        array_push($JSON_RESULT['cat_planes'], $Rol);
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['cat_planes']     = [];
                            }
                            /*<Respuesta>*/
                                $JSON_RESULT['message'] = "Good";   
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                           
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                /*<CONSULTA PLANES>*/

                /*<CONSULTA DETALLES>*/
                    /*<Query>*/
                            $querySelect = '    SELECT    
                                                        (
                                                            SELECT  COUNT(*) 
                                                            FROM    facturacion   
                                                            WHERE                                                                    
                                                                    facturacion.bstate          = 1                  AND
                                                                    facturacion.estatus         = "PAGADO"           AND    
                                                                    facturacion.fecha BETWEEN "'.$MES_INICIO.'" AND "'.$MES_ACTUALIDAD.'"

                                                        )as NuevoClientes,
                                                        (
                                                            SELECT  COUNT(*) 
                                                            FROM    facturacion   
                                                            WHERE                                                                    
                                                                    facturacion.bstate          = 1                  AND
                                                                    facturacion.estatus         = "PENDIENTE"        AND
                                                                    facturacion.fecha BETWEEN "'.$MES_INICIO.'" AND "'.$MES_ACTUALIDAD.'"

                                                        )as NuevoFacturas,
                                                        (
                                                            SELECT  COUNT(*) 
                                                            FROM    usuarios   
                                                            WHERE                                                                    
                                                                    usuarios.bstate          = 1                  AND
                                                                    (
                                                                        usuarios.estatus         = "PENDIENTE"           OR
                                                                        usuarios.estatus         = "CONFIRMADO"          OR
                                                                        usuarios.estatus         = "REVISAR"             OR
                                                                        usuarios.estatus         = "RECHAZADO"          
                                                                    ) AND
                                                                    usuarios.fechaCreacion BETWEEN "'.$MES_INICIO.'" AND "'.$MES_ACTUALIDAD.'"
                                                        )AS NuevosUsuarios,
                                                        (
                                                            SELECT  COUNT(*)  
                                                            FROM    cat_planes, membresia, facturacion  
                                                            WHERE            
                                                                    facturacion.idMembresia         = membresia.idMembresia AND
                                                                    membresia.idPlan                = cat_planes.idPlan AND                                                      
                                                                    cat_planes.bstate               = 1                  AND
                                                                    facturacion.fechaCreacion BETWEEN "'.$MES_INICIO.'" AND "'.$MES_ACTUALIDAD.'"
                                                        )as planes
                                                            
                                                         ';
                    /*<Query>*/

                
                    $JSON_RESULT['querySelect']           = $querySelect;

                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {                                        
                                        array_push($JSON_RESULT['information'], $Rol);
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['information']     = [];
                            }
                            /*<Respuesta>*/
                                $JSON_RESULT['message'] = "Good";   
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                           
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                /*<CONSULTA DETALLES>*/

                

                return $JSON_RESULT;
            }
        /*<Method selectAgentesEstadisticasAdmin>*/

        /*<selectMes>*/
            public function selectMes( $fecha1, $fecha2 ){
                /*<Variables> */
                    $JSON_RESULT                                = [];
                    $JSON_RESULT['information']                 = [];
                    $JSON_RESULT['fechas']                      = [];
                    $JSON_RESULT['message']                     = '';
                    $JSON_RESULT['error']                       = '';

                    /*<RANGO FECHA>*/   
                        $RANGO_FECHAS   = [];             
                        $fechaInicio    = new \DateTime($fecha1);   
                        $fechaFin       = new \DateTime($fecha2);
                        
                        $fechaInicio->modify('first day of this month');
                        $fechaFin->modify('last day of this month');                  
                        
                        $intervalo      = new \DateInterval('P1M'); // Intervalo de un mes
                        $periodo        = new \DatePeriod($fechaInicio, $intervalo, $fechaFin->modify('+1 day'));
                        
                        foreach ($periodo as $fecha) {
                            // Añadir el primer día del mes
                            $fechaInicio_W = clone $fecha;
                            $fechaInicio_W->modify('first day of this month');
                            
                            // Añadir el último día del mes
                            $fechaFinal_W = clone $fecha;
                            $fechaFinal_W->modify('last day of this month');
                            
                            $RANGO_FECHAS[] = [                                
                                'fechaInicio_W' => $fechaInicio_W->format('Y-m-d 00:00:01'),
                                'fechaFinal_W' => $fechaFinal_W->format('Y-m-d 23:59:59')
                            ];
                        }
                        
                        // Ahora $RANGO_FECHAS contendrá pares de fechas de inicio y fin para cada mes
                    
                        $JSON_RESULT['fechas']                      = $RANGO_FECHAS;
                    /*</RANGO FECHA>*/

                    /*<CONSULTA>*/
                        for($j = 0; $j < count($RANGO_FECHAS); $j++){

                            /*<VARIABLES>*/
                                $JSON_INFORMATION = [];
                            /*<VARIABLES>*/

                            /*<WHERE FECHA>*/
                                /*<FECHAS>*/
                                    $fechaInicio    = $RANGO_FECHAS[$j];
                                    $fechaFinal     = $RANGO_FECHAS[$j];
                                /*</FECHAS>*/
                                $fechaInicio_W    = $fechaInicio['fechaInicio_W'];
                                $fechaFinal_W     = $fechaFinal['fechaFinal_W'];                               
                            /*<WHERE FECHA>*/

                            /*<Query>*/
                                $querySelect = '    
                                                        SELECT  IFNULL( SUM( facturacion.costo ), 0 ) AS total 
                                                            FROM    facturacion   
                                                            WHERE                                                                    
                                                                    facturacion.bstate          = 1                  AND
                                                                    facturacion.estatus         = "PAGADO"           AND    
                                                                    facturacion.fecha BETWEEN   "'.$fechaInicio_W.'" AND "'.$fechaFinal_W.'"'; 
                            /*<Query>*/           

                            $this->open();            
                                if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                                    if ($resultQuery->num_rows > 0) {
                                        /*<Captura>*/
                                            while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {   
                                                /*<CAPTURA>*/
                                                    $Rol['fechaInicio_W'] = $fechaInicio_W;    
                                                    $Rol['fechaFinal_W'] = $fechaFinal_W;    
                                                /*<CAPTURA>*/                                                                
                                                array_push($JSON_RESULT['information'], $Rol );
                                            }
                                        /*</Captura>*/
                                    }
                                    
                                } else {
                                    /*<Respuesta>*/
                                    /*</Respuesta>*/
                                }        
                            $this->closet();
                        }
                    /*<CONSULTA>*/

                    $JSON_RESULT['message']                     = 'Good';
                /*</Variables> */
                return $JSON_RESULT;
            }
        /*<selectMes>*/

      

       
    }

    