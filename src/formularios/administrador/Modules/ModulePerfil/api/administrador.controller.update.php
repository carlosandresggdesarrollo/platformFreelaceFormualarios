<?php
/*<Include classes>*/
    include_once('../model/administrador.model.usuario.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModulePerfil\Model\usuario \usuario             as usuario;
/*<Import>*/   

$JSON_RESULT            = [];
/*<Controlador>*/      
    try{
        /*<Instaciacion de objetos>*/                
            $Object = new usuario();
        /*</Instaciacion de objetos>*/ 
        
        /*<Proceso>*/
            $JSON_RESULT    = [];
            $IP             = isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
            $JSON_RESULT    =  $Object->update(
                $_POST['txt_idSeleccion'],
                $_POST['txt_nombre'],
                $_POST['txt_apellido'],
                $_POST['txt_email'],
                $_POST['txt_imagen'],
                $IP
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