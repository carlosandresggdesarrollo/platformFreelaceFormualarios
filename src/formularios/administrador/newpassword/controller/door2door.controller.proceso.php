<?php
/*<Include classes>*/
    include_once('../model/administrador.model.login.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\newpassword\Model\NewPassword\NewPassword as NewPassword;
/*</Import>*/


        $JSON_RESULT            = [];
        /*<Controlador>*/      
            try{
                /*<Instaciacion de objetos>*/                
                    $Object = new NewPassword();
                /*</Instaciacion de objetos>*/ 
                  
                /*</Proceso>*/                   
                    $Object->selectEmail($_POST['email']);
                /*</Proceso>*/ 

                /*<Respuesta>*/  
                    echo json_encode($JSON_RESULT);
                /*</Respuesta>*/  

            } catch(Exepction $e){
                $JSON_RESULT            = [];
                $JSON_RESULT['message'] = 'Sorry errt server'; 
            }
            
        /*</Controlador>*/    

