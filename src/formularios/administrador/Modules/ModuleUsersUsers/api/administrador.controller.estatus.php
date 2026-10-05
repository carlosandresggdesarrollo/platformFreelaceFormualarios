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
            $ObjectRoles = new Usuarios_create();
        /*</Instaciacion de objetos>*/      
        /*</Proceso>*/  
            $IP             = authClientIp(); 
            $JSON_RESULT    = $ObjectRoles->updateEstatus(
                $_POST['estatus'],
                $_POST['idUsuario'],
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
  
/*<Validacion de tocken>*/