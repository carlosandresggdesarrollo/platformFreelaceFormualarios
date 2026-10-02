<?php
/*<Include classes>*/
    include_once('../model/administrador.model.usuario.php');
/*</Include classes>*/



$JSON_RESULT            = [];
/*<Controlador>*/      
    try{
        /*<Instaciacion de objetos>*/                
            $Object = new usuario();
        /*</Instaciacion de objetos>*/ 
        
        /*<Proceso>*/  
            $JSON_RESULT    = []; 
            $IP             = isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']; 
            $tipo       = isset($_POST['txt_tipo']) ? strtoupper($_POST['txt_tipo']) : 'CLIENTE';
            $profesion  = isset($_POST['txt_profesion']) ? $_POST['txt_profesion'] : '';
            $JSON_RESULT    =  $Object->crear(
                $_POST['txt_usuario'],
                $_POST['txt_contrasena'],
                $_POST['txt_nombre'],
                $_POST['txt_apellido'],
                $_POST['txt_email'],
                $IP,
                $tipo,
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
    
/*</Controlador>*/    
       

?>