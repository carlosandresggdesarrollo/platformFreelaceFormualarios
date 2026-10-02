<?php

/*<Include classes>*/
    include_once('../model/administrador.model.empresa.php');
    include_once('../../ModulePugins/administrador.Pugins.GeneratorTocken.php');
/*</Include classes>*/

/*<Import>*/   
    use administrador\Modules\ModulePugins\GeneradorTocken\GeneradorTocken as GeneradorTocken_selecrFull;
    use administrador\Modules\ModuleSettingsCompanies\Model\SettingsCompanies\SettingsCompanies as SettingsCompanies_selecrFull;
/*<Import>*/ 
/*<Instaciacion de objetos>*/                
    $ObjectToken = new GeneradorTocken_selecrFull();
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
        /*<Controlador>*/   
            try{
                /*<Instaciacion de objetos>*/                
                    $ObjectRoles = new SettingsCompanies_selecrFull();
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

    }else{
    /*<Token invalido>*/
        $JSON_RESULT            = [];
        $JSON_RESULT['message'] = 'Sorry invalid Tocken'; 
        echo json_encode($JSON_RESULT);
    /*</Token invalido>*/
    }
/*<Validacion de tocken>*/
?>