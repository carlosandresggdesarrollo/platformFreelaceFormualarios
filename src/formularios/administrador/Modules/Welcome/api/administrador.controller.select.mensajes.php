<?php

/*<Include classes>*/
    include_once('../model/administrador.model.estadisticas.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\Welcome\Model\estadisticas\estadisticas             as estadisticas;
/*<Import>*/ 
/*</ontrolador>*/   
    try{
        /*<Instaciacion de objetos>*/                
            $estadisticas = new estadisticas();
        /*</Instaciacion de objetos>*/      
        /*</Proceso>*/  
            $JSON_RESULT = $estadisticas->selectMensajes();
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