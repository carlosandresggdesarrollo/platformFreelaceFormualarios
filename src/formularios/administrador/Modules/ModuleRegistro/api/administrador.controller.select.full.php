<?php

/*<Include classes>*/
    include_once('../model/administrador.model.usuario.php');
/*</Include classes>*/


/*</ontrolador>*/   
    try{
        /*<Instaciacion de objetos>*/                
            $ObjectRoles = new usuario();
        /*</Instaciacion de objetos>*/      
        /*</Proceso>*/  
            $JSON_RESULT = $ObjectRoles->selectFull();
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