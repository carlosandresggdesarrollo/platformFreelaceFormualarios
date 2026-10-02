<?php
/*<Include classes>*/
    include_once('../model/administrador.model.usuarioas.php');
/*</Include classes>*/

/*<Import>*/   
use  administrador\Modules\ModuleUsersUsers\model\Usuarios\Usuarios       as Usuarios_create;
/*</Import>*/


$JSON_RESULT            = [];
        
/*<Controlador>*/      
    try{
        /*<Instaciacion de objetos>*/                
            $Object = new Usuarios_create();
        /*</Instaciacion de objetos>*/ 
            
        /*</Proceso>*/  
        $JSON_RESULT =  $Object->deleteImagen($_POST['txt_idUsuario']); 
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

?>