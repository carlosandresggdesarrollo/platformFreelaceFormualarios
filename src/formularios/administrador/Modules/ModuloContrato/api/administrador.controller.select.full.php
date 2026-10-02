<?php

/*<Include classes>*/
    include_once('../model/administrador.model.contrato.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModuloContrato\Model\contrato\contrato             as contrato;
/*<Import>*/ 
/*</ontrolador>*/   
    try{
        /*<Instaciacion de objetos>*/                
            $ObjectRoles = new contrato();
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