<?php

/*<Include classes>*/
    include_once('../model/administrador.model.usuario.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModulePerfil\Model\usuario \usuario             as usuario;
/*<Import>*/ 
/*</ontrolador>*/   
    try{
        /*<Instaciacion de objetos>*/                
            $ObjectRoles = new usuario();
        /*</Instaciacion de objetos>*/      
        /*</Proceso>*/  
            $JSON_RESULT = $ObjectRoles->selectMunicipioFull();
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