<?php
/*<Include classes>*/
    include_once('../model/administrador.model.login.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Login\Model\Login\Login as Login;
/*</Import>*/




    $JSON_RESULT            = [];

    /*<Controlador>*/      
        try{
            /*<Instaciacion de objetos>*/                
                $Object = new Login();
            /*</Instaciacion de objetos>*/ 
            session_start();

            /*<Proceso>*/    
                /*<VARIABLES>*/
                    $RESPUESTA_PASO_1 = [];
                    $RESPUESTA_PASO_2 = [];
                    $RESPUESTA_PASO_3 = [];
                    $RESPUESTA_PASO_4 = [];
                    $RESPUESTA_PASO_5 = [];

                    $ID_USUARIO         = 0;
                    $ID_SESSION         = 0;
                    $SESSION            = $_SESSION['administrador-session'];
                /*</VARIABLES>*/

                /*< 1 - CONSULTAR TABLA DE USUARIOS >*/
                    $RESPUESTA_PASO_1 =  $Object->validatorLogin(
                                    $_POST['Usuario'],
                                    $_POST['Password']
                                ); 
                    if($RESPUESTA_PASO_1['message'] == 'Good' && $RESPUESTA_PASO_1['existe'] != "EXISTE"  ){
                        
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_1']    = $RESPUESTA_PASO_1;
                            $JSON_RESULT['message']             = 'USUARIO NO EXISTE';         
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }else if($RESPUESTA_PASO_1['message'] != 'Good'){
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_1']    = [];  
                            $JSON_RESULT['RESPUESTA_PASO_1']    = $RESPUESTA_PASO_1;     
                            $JSON_RESULT['message']         = 'ERROR SISTEMA'; 
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }
                    $RESPUESTA_PASO_1['sesion']         = $SESSION; 
                    $JSON_RESULT['RESPUESTA_PASO_1']    = [];  
                    $JSON_RESULT['RESPUESTA_PASO_1']    = $RESPUESTA_PASO_1;      
                    $ID_USUARIO                         = $RESPUESTA_PASO_1['idUsuario'];    
                /*</ 1 - CONSULTAR TABLA DE USUARIOS >*/

                /*< 2 - CONSULTAR TABLA RELACION USUARIO >*/
                    $RESPUESTA_PASO_2 =  $Object->consultarRelacionUsuarios( $SESSION ); 
                    
                    if($RESPUESTA_PASO_2['message'] != 'Good' || $RESPUESTA_PASO_1['existe'] !=  "EXISTE" ){
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_2']    = [];  
                            $JSON_RESULT['RESPUESTA_PASO_2']    = $RESPUESTA_PASO_2;     
                            $JSON_RESULT['message']             = 'ERROR SISTEMA'; 
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }
                    $ID_SESSION = $RESPUESTA_PASO_2['ID_SESSION'];

                    $JSON_RESULT['RESPUESTA_PASO_2'] =  $RESPUESTA_PASO_2;
                /*</ 2 - CONSULTAR TABLA RELACION USUARIO >*/


                /*< 3 - INSERTAR REGISTRO EN LA  TABLA RELACION USUARIO >*/
                    $RESPUESTA_PASO_3 =  $Object->InsertarRelacionUsuarios(                                            
                                        $ID_SESSION,
                                        $ID_USUARIO
                    ); 
                    if($RESPUESTA_PASO_3['message'] != 'Good' ){
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_3']    = [];  
                            $JSON_RESULT['RESPUESTA_PASO_3']    = $RESPUESTA_PASO_3;     
                            $JSON_RESULT['message']             = 'ERROR SISTEMA'; 
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }
                    $JSON_RESULT['RESPUESTA_PASO_3']    = [];  
                    $JSON_RESULT['RESPUESTA_PASO_3']    = $RESPUESTA_PASO_3;  
                /*</ 3 - INSERTAR REGISTRO EN LA TABLA RELACION USUARIO >*/

                /*< 4 - VALIDACION DEL ESTATUS ESTA EN PENDIENTE >*/
                    $RESPUESTA_PASO_4 =  $Object->ValidacionEstatus( $ID_USUARIO ); 
                    if($RESPUESTA_PASO_4['message'] != 'Good' ){
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_4']    = [];  
                            $JSON_RESULT['RESPUESTA_PASO_4']    = $RESPUESTA_PASO_4;     
                            $JSON_RESULT['message']             = 'ERROR SISTEMA'; 
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }else if($RESPUESTA_PASO_4['message'] == 'Good' &&  $RESPUESTA_PASO_4['existe']    == "EXISTE"){
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_4']    = [];  
                            $JSON_RESULT['RESPUESTA_PASO_4']    = $RESPUESTA_PASO_4;     
                            $JSON_RESULT['message']             = 'USUARIO PENDIENTE'; 
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }else if($RESPUESTA_PASO_4['message'] == 'Good' && $RESPUESTA_PASO_4['existe']    == "NO EXISTE"){
                        /*<TERMINO PROCESO>*/
                            $JSON_RESULT['RESPUESTA_PASO_4']    = [];  
                            $JSON_RESULT['RESPUESTA_PASO_4']    = $RESPUESTA_PASO_4;     
                            $JSON_RESULT['message']             = 'Good'; 
                            echo json_encode($JSON_RESULT);
                            return true;
                        /*</TERMINO PROCESO>*/
                    }

                    
                /*</ 4 -VALIDACION DEL ESTATUS ESTA EN PENDIENTE >*/
                
                
                            
                
            /*</Proceso>*/ 

            /*<Respuesta>*/  
                echo json_encode($JSON_RESULT);
            /*</Respuesta>*/  

        } catch(Exepction $e){
            $JSON_RESULT            = [];
            $JSON_RESULT['message'] = 'Sorry errt server'; 
        }
        
    /*</Controlador>*/    
    
