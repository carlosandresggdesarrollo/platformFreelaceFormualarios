<?php
/*<Include classes>*/
    include_once('../model/administrador.model.email.php');
/*</Include classes>*/



        $JSON_RESULT            = [];
        /*<Controlador>*/      
            try{
                /*<Instaciacion de objetos>*/                
                    $Object = new NewPassword();
                /*</Instaciacion de objetos>*/ 
                  
                /*</Proceso>*/                   
                    $JSON_RESULT = $Object->selectEmail($_POST['email']);
                /*</Proceso>*/ 

                /*<Respuesta>*/  
                    echo json_encode($JSON_RESULT);
                /*</Respuesta>*/  

            } catch(Exepction $e){
                $JSON_RESULT            = [];
                $JSON_RESULT['message'] = 'Sorry errt server'; 
            }
            
        /*</Controlador>*/    

