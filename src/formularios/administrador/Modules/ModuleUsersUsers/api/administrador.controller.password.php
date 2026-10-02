<?php
/*<Include classes>*/
    include_once('../model/administrador.model.usuarioas.php');
/*</Include classes>*/

/*<Import>*/
    use administrador\Modules\ModuleUsersUsers\Model\Usuarios\Usuarios as Usuarios;
/*</Import>*/

$JSON_RESULT = [];
/*<Controlador>*/
    try{
        /*<Instanciacion de objetos>*/
            $Object = new Usuarios();
        /*</Instanciacion de objetos>*/

        /*<Proceso>*/
            $JSON_RESULT = [];
            $IP = isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']);

            $JSON_RESULT = $Object->updatePassword(
                $_POST['txt_idUsuario'],
                $_POST['txt_contrasenaNueva'],
                $IP
            );
        /*</Proceso>*/

        /*<Respuesta>*/
            echo json_encode($JSON_RESULT);
        /*</Respuesta>*/

    } catch(Exception $e){
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = 'Sorry error server';
        $JSON_RESULT['error'] = $e->getMessage();
        echo json_encode($JSON_RESULT);
    }

/*</Controlador>*/
?>