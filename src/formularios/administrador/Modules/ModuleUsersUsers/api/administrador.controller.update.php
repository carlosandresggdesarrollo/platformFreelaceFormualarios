<?php

/*<Include classes>*/
    include_once('../model/administrador.model.usuarioas.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModuleUsersUsers\model\Usuarios\Usuarios       as Usuarios_create;
/*</Import>*/


/*<Controlador>*/ 
    try{     
        /*<Instaciacion de objetos>*/                
            $Object = new Usuarios_create();
        /*</Instaciacion de objetos>*/ 
    
        /*<Proceso>*/  
        $IP = isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']; 

            $profesion = isset($_POST['txt_profesion']) ? $_POST['txt_profesion'] : '';
            $JSON_RESULT = [];
            $JSON_RESULT = $Object->updateUsuario(
                                    $_POST['txt_idUsuario'],
                                    $_POST['txt_usuario'],
                                    $_POST['txt_nombre'],
                                    $_POST['txt_apellidos'],
                                    $_POST['txt_email'],
                                    $_POST['cb_tipoUsuario'],
                                    $_POST['txt_imagen'],
                                    $IP,
                                    $profesion
                            );    
        /*</Proceso>*/  
        
        /*<Respuesta>*/  
            echo json_encode($JSON_RESULT);
        /*</Respuesta>*/  
    } catch(Exepction $e){
        $JSON_RESULT            = [];
        $JSON_RESULT['message'] = 'Sorry errt server'; 
    }
/*<Controlador>*/
    

?>