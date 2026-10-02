<?php
/*<Include classes>*/
    include_once('../model/administrador.model.empresa.php');
    include_once('../../ModulePugins/administrador.Pugins.GeneratorTocken.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModulePugins\GeneradorTocken\GeneradorTocken                                   as GeneradorTocken_create;
    use  administrador\Modules\ModuleSettingsCompanies\Model\SettingsCompanies\SettingsCompanies              as Services_create;
/*<Import>*/   

/*<Instaciacion de objetos>*/                
    $ObjectToken = new GeneradorTocken_create();
/*</Instaciacion de objetos>*/

/*<Variables generales>*/
$URL  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]"; 
$URLtocken = $URL.'-'.$ObjectToken->generatorTocken('tocken-administradors-01198756765345431234534ASDFSDFSDF-');
/*<Variables generales>*/

/*<Validacion de tocken>*/
if(true){      

        $JSON_RESULT            = [];
        /*<Controlador>*/      
            try{
                /*<Instaciacion de objetos>*/                
                    $Object = new Services_create();
                /*</Instaciacion de objetos>*/ 
                $Direccion = '';
                foreach($_FILES as $file){
                    if($file["error"]==UPLOAD_ERR_OK){
                        move_uploaded_file($file["tmp_name"], "./Documentos/D2D_File_".date("Ymdhis")."__".$file["name"]);   
                        $Direccion = '/administrador/Modules/ModuleSettingsCompanies/api/Documentos/administrador_File_'.date("Ymdhis")."__".$file["name"];
                       
                    }
                    if(isset($_POST['create-id-administrador'])){                
                        if($_POST['create-id-administrador'] == 0){
                            $JSON_RESULT =  $Object->create(
                                        $_POST['create-razonsocial-administrador'],
                                        $_POST['create-rfc-administrador'],
                                        $_POST['create-domicilio-administrador'],
                                        $_POST['create-noexterior-administrador'],
                                        $_POST['create-nointerior-administrador'],
                                        $_POST['create-colonia-administrador'],
                                        $_POST['create-ciudad-administrador'],
                                        $_POST['create-estado-administrador'],
                                        $_POST['create-pais-administrador'],
                                        $_POST['create-codigopostal-administrador'],
                                        $_POST['create-telefono-administrador'],
                                        $_POST['create-celular-administrador'],
                                        $_POST['create-email-administrador'],
                                        $Direccion    
                                    ); 
    
                        }else{    
                            $JSON_RESULT = $Object->update(
                                        $_POST['create-id-administrador'],
                                        $_POST['create-razonsocial-administrador'],
                                        $_POST['create-rfc-administrador'],
                                        $_POST['create-domicilio-administrador'],
                                        $_POST['create-noexterior-administrador'],
                                        $_POST['create-nointerior-administrador'],
                                        $_POST['create-colonia-administrador'],
                                        $_POST['create-ciudad-administrador'],
                                        $_POST['create-estado-administrador'],
                                        $_POST['create-pais-administrador'],
                                        $_POST['create-codigopostal-administrador'],
                                        $_POST['create-telefono-administrador'],
                                        $_POST['create-celular-administrador'],
                                        $_POST['create-email-administrador'],
                                        $Direccion
                                );    
    
                        }
                    }else{
                        $JSON_RESULT['message'] = 'no hay id'; 
                    }
                }   
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