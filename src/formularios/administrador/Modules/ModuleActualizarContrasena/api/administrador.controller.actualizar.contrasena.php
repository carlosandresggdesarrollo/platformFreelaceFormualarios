<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/*<Include classes>*/
    include_once('../model/administrador.model.correo.php');
/*</Include classes>*/

/*<Import>*/
use  administrador\Modules\ModuleActualizarContrasena\Model\correo\correo as correo;

/*<Controlador>*/
$JSON_RESULT = [];

try {
    /*<Instaciacion de objetos>*/
        $Object = new correo();
    /*</Instaciacion de objetos>*/

    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    $token = isset($input['token']) ? $input['token'] : '';
    $nuevaContrasena = isset($input['contrasena']) ? $input['contrasena'] : '';

    if(empty($token)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'Token no proporcionado';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if(empty($nuevaContrasena)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'La nueva contraseña es requerida';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // Validar contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)
    if(strlen($nuevaContrasena) < 8){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'La contraseña debe tener al menos 8 caracteres';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if(!preg_match('/[A-Z]/', $nuevaContrasena)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'La contraseña debe tener al menos una mayúscula';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if(!preg_match('/[a-z]/', $nuevaContrasena)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'La contraseña debe tener al menos una minúscula';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if(!preg_match('/[0-9]/', $nuevaContrasena)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'La contraseña debe tener al menos un número';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // Actualizar contraseña
    $JSON_RESULT = $Object->actualizarContrasena($token, $nuevaContrasena);

    echo json_encode($JSON_RESULT);

} catch(Exception $e){
    $JSON_RESULT['message'] = 'Bad';
    $JSON_RESULT['error'] = 'Error del servidor: ' . $e->getMessage();
    echo json_encode($JSON_RESULT);
}
/*</Controlador>*/

?>
