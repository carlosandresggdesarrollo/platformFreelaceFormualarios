<?php

/*<Include classes>*/
    include_once('../model/administrador.model.usuarioas.php');  
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModuleUsersUsers\model\Usuarios\Usuarios       as Usuarios_create;
/*<Import>*/ 
        /*<Controlador>*/   
            try{
                /*<Instaciacion de objetos>*/                
                    $ObjectRoles = new Usuarios_create();
                /*</Instaciacion de objetos>*/    

                /*</Proceso>*/  
                    $JSON_RESULT = $ObjectRoles->selectFull(
                        $_POST['Busqueda'],
                        $_POST['Hoja'],
                        $_POST['Ordenamiento'],
                        $_POST['ASC_DESC']
                    );
                /*</Proceso>*/  

                /*<Respuesta>*/  
                    unset( $ObjectRoles);
                    unset( $ObjectToken );
                    echo json_encode($JSON_RESULT);
                /*</Respuesta>*/ 

            } catch(Exepction $e){
                $JSON_RESULT            = [];
                $JSON_RESULT['message'] = 'Sorry errt server'; 
            }

        /*</Controlador>*/    

   
/*<Validacion de tocken>*/
?>