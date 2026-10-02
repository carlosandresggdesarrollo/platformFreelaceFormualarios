<?php
/*<Include classes>*/
    include_once('../model/administrador.model.session.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Main\Model\Session\Session as Session;
/*</Import>*/

 

$JSON_RESULT            = [];
/*<Controlador>*/      
    try{
        /*<Instaciacion de objetos>*/                
            $Object = new Session();
        /*</Instaciacion de objetos>*/ 
        
            $JSON_RESULT = $Object->selectFullPlan();
            echo json_encode($JSON_RESULT);
            return true;
        /*</TERMINO PROCESO>*/
    } catch(Exepction $e){
        $JSON_RESULT            = [];
        $JSON_RESULT['message'] = 'Sorry errt server'; 
    }
    
/*</Controlador>*/    
   