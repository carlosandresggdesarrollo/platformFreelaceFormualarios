<?php
$JSON_RESULT            = [];

/*<Controlador>*/      
    try{
        /*<Instaciacion de objetos>*/    
            $Direccion = '';
        /*</Instaciacion de objetos>*/ 
            
        /*</Proceso>*/  
            foreach($_FILES as $file){
                if($file["error"]==UPLOAD_ERR_OK){
                    $Direccion = '/upload/'.date("Ymdhis").$file["name"];                            
                    move_uploaded_file($file["tmp_name"], '/var/www/html'.$Direccion);                               
                    
                }
            }    
        /*</Proceso>*/ 
        $JSON_RESULT['direccion']   = $Direccion;
        $JSON_RESULT['message']     = 'Good';
        /*<Respuesta>*/  
            echo json_encode($JSON_RESULT);
        /*<Respuesta>*/  

    } catch(Exepction $e){
        $JSON_RESULT            = [];
        $JSON_RESULT['message'] = 'Sorry errt server'; 
    }            
/*</Controlador>*/    
       