<?php
/*<Include classes>*/
    include_once('../model/administrador.model.login.php');
    include_once('../../Modules/ModulePugins/administrador.Pugins.GeneratorTocken.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModulePugins\GeneradorTocken\GeneradorTocken as GeneradorTocken_validation;
    use  administrador\Login\Model\Login\Login as Login_validation;
/*</Import>*/

/*<Instaciacion de objetos>*/                
    $ObjectToken = new GeneradorTocken_validation();
/*</Instaciacion de objetos>*/

/*<Variables generales>*/
    $URL  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]"; 
    $URLtocken = $URL.'-'.$ObjectToken->generatorTocken('tocken-administradors-01198756765345431234534ASDFSDFSDF-');
/*<Variables generales>*/

/*<Validacion de tocken>*/
    if(isset($_POST['TockenOfdoor2doordoor2door']) && (
                                                    $_POST['TockenOfdoor2doordoor2door'] == $URLtocken  ||
                                                    $ObjectToken->validadorTocken($URLtocken) 
                                                )){      

        $JSON_RESULT            = [];
        /*<Controlador>*/      
            try{
                /*<Instaciacion de objetos>*/                
                    $Object = new Login_validation();
                /*</Instaciacion de objetos>*/ 
                  
                /*</Proceso>*/                   
                    $JSON_RESULT =  $Object->validatorLogin(
                                        $_POST['login-usuario-administrador'],
                                        $_POST['login-contrasena-administrador']
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
       
    }else{
        /*<Token invalido>*/
            $JSON_RESULT            = [];
            $JSON_RESULT['message'] = 'Sorry invalid Tocken'; 
            echo json_encode($JSON_RESULT);
        /*</Token invalido>*/
    }
/*<Validacion de tocken>*/
