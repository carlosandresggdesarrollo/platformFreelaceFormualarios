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
            $Direccion = '';
        /*</Instaciacion de objetos>*/ 
            
        /*</Proceso>*/  
        $IP             = authClientIp(); 
        $JSON_RESULT    =  $Object->deleteUsuario($_POST['eliminar-id-administrador'], $IP); 
        /*</Proceso>*/ 

        /*<Respuesta>*/  
            echo json_encode($JSON_RESULT);
        /*</Respuesta>*/  

    } catch(Exepction $e){
        $JSON_RESULT            = [];
        $JSON_RESULT['message'] = 'Sorry errt server'; 
    }            
/*</Controlador>*/    
   
/*<Validacion de tocken>*/