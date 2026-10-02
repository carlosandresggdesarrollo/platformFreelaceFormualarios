<?php
                
                
/*
*    Autor:         Carlos Andres González Gómez  
*    Description;   Class of connection MariaDb
**/

namespace  administrador\Modules\ModulePugins\funciones;
    /*<Includes>*/
        include_once('administrador.Cofiguration.Conection.php');
    /*<Includes>*/
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as Conectionfunciones;
    /*<use>*/
    class funciones extends Conectionfunciones{
      
      

        public function __construct(){ }


        /*<VALOIDACION>*/
            public function validacion($idCliente, $opcion, $cantidad){ 
                /*<Variables> */
                        $JSON_RESULT                    = [];
                        $JSON_RESULT['message']         = '';
                        $JSON_RESULT['error']           = '';
                        $JSON_RESULT['resultado']       = false;
                        $DATE                           = date('Y-m-d h:i:s');
                    /*</Variables> */

                    /*<TIENE MEMBRESIA>*/
                        /*<Query> */
                            $querySelect = '    SELECT  
                                                        me.vinculaciones,
                                                        me.agentes,
                                                        me.bot,
                                                        me.menu,
                                                        (
                                                            SELECT facturacion.fechaCorte FROM facturacion   WHERE facturacion.idMembresia = me.idMembresia ORDER BY facturacion.fechaCorte DESC LIMIT 1
                                                        ) AS  fechaCorte,
                                                        (
                                                            SELECT facturacion.estatus FROM facturacion   WHERE facturacion.idMembresia = me.idMembresia ORDER BY facturacion.fechaCorte DESC LIMIT 1
                                                        ) AS  estatus
                                                    FROM membresia_view  me
                                                    WHERE  
                                                            bstate          =   1 AND 
                                                            idUsuario       =   '.$idCliente.';';
                        /*</Query> */
                        $JSON_RESULT['querySelect']     = $querySelect;
                        $this->open();            
                            if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                                if ($resultQuery->num_rows > 0) {
                                    /*<VALIDACION>*/
                                        
                                            while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                                if($Rol['estatus'] == 'PAGADO' && $this->comparacionFechas($DATE, $Rol['fechaCorte'])){
                                                    switch($opcion){
                                                        case 'vinculaciones':{
                                                            if(intval($Rol['vinculaciones']) > intval($cantidad)){
                                                                $JSON_RESULT['resultado']   = true;
                                                                $JSON_RESULT['message']     = 'Good';
                                                            }else{
                                                                $JSON_RESULT['resultado']   = false;
                                                                $JSON_RESULT['message']     = 'vinculaciones excedidas';
                                                            }
                                                            break;
                                                        }  
                                                        case 'agentes':{
                                                            if(intval($Rol['agentes']) > intval($cantidad)){
                                                                $JSON_RESULT['resultado']   = true;
                                                                $JSON_RESULT['message']     = 'Good';
                                                            }else{
                                                                $JSON_RESULT['resultado']   = false;
                                                                $JSON_RESULT['message']     = 'agentes excedidos';
                                                            }
                                                            break;
                                                        }  
                                                        case 'area':{
                                                            if(intval($Rol['area']) > intval($cantidad)){
                                                                $JSON_RESULT['resultado']   = true;
                                                                $JSON_RESULT['message']     = 'Good';
                                                            }else{
                                                                $JSON_RESULT['resultado']   = false;
                                                                $JSON_RESULT['message']     = 'area excedidas';
                                                            }
                                                            break;
                                                        }  
                                                        case 'bot':{
                                                            if(intval($Rol['bot']) > intval($cantidad)){
                                                                $JSON_RESULT['resultado']   = true;
                                                                $JSON_RESULT['message']     = 'Good';
                                                            }else{  
                                                                $JSON_RESULT['resultado']   = false;
                                                                $JSON_RESULT['message']     = 'bot excedidos';
                                                            }
                                                            break;
                                                        }     
                                                        case 'menu':{
                                                            if(intval($Rol['menu']) > intval($cantidad)){
                                                                $JSON_RESULT['resultado']   = true;
                                                                $JSON_RESULT['message']     = 'Good';
                                                            }else{
                                                                $JSON_RESULT['resultado']   = false;
                                                                $JSON_RESULT['message']     = 'menus excedidos';
                                                            } 
                                                            break;
                                                        }     
                                                    }    
                                                }else{
                                                    $JSON_RESULT['message'] = 'MEMBRESIA VENCIDA';
                                                }                                        
                                            }
                                        
                                    /*</VALIDACION>*/
                                }else{
                                    $JSON_RESULT['resultado']   = false;
                                    $JSON_RESULT['message']     = "NO TIENE MEMBRESIA";
                                }
                            } else {
                                /*<Respuesta>*/
                                    $JSON_RESULT['message']         = "ERROR";       
                                    $JSON_RESULT['resultado']       = false;                    
                                    $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                                /*</Respuesta>*/
                            }        
                        $this->closet();
                    /*<TIENE MEMBRESIA>*/
                    return $JSON_RESULT;
            }
        /*</VALOIDACION>*/


        /*<COMPARACION>*/
            public function comparacionFechas($fecha1, $fecha2) {
                /*<VARIABLES>*/
                    $formato = 'Y-m-d';
                    $fecha1  = explode(' ', $fecha1);
                    $fecha2  = explode(' ', $fecha2);
                    $d1      = \DateTime::createFromFormat($formato, $fecha1[0]);
                    $d2      = \DateTime::createFromFormat($formato, $fecha2[0]);      
                /*<VARIABLES>*/  
                /*<VALIDACION>*/
                    if ($d1 < $d2) {        /*<ANTERIOR>*/    return true;
                    } else if ($d1 > $d2) { /*<POSTERIOR>*/   return false;
                    } else {                /*<IGUAL>*/       return false;
                    }
                /*<VALIDACION>*/
            }
        /*</COMPARACION>*/

        /*<CONSULTAR CANTIDAD TOTALES>*/
            public function consultarHijos($querySelectConteo){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['total']           = 0;                      
                /*</Variables> */

                /*<Query> */
                    $querySelect = $querySelectConteo;
                /*</Query> */
                
                $JSON_RESULT['querySelect']     = $querySelect;
                
                $this->open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                        /*<Captura>*/
                            while ($R = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                $JSON_RESULT['total'] = $R['total'];
                            }
                        /*</Captura>*/
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
                return $JSON_RESULT;
            }
        /*<CONSULTAR CANTIDAD TOTALES>*/
          
      
    }



?>