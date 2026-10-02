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

    // Obtener email del POST
    $input = json_decode(file_get_contents('php://input'), true);
    $email = isset($input['email']) ? $input['email'] : (isset($_POST['email']) ? $_POST['email'] : '');

    if(empty($email)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'El correo electrónico es requerido';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // Paso 1: Verificar si el email existe
    $verificacion = $Object->verificarEmail($email);

    if($verificacion['message'] !== 'Good'){
        echo json_encode($verificacion);
        exit;
    }

    if(!$verificacion['existe']){
        // Por seguridad, no revelamos si el email existe o no
        $JSON_RESULT['message'] = 'Good';
        $JSON_RESULT['info'] = 'Si el correo existe, recibirás un enlace de recuperación.....';
        echo json_encode($JSON_RESULT);
        exit;
    }

    $usuario = $verificacion['usuario'];

    // Paso 2: Generar token
    $tokenResult = $Object->generarToken($email, $usuario['idUsuario']);

    if($tokenResult['message'] !== 'Good'){
        echo json_encode($tokenResult);
        exit;
    }

    // Paso 3: Obtener configuración de correo
    $configCorreo = $Object->obtenerConfigCorreo();

    if($configCorreo['message'] !== 'Good'){
        echo json_encode($configCorreo);
        exit;
    }

    // Paso 4: Enviar correo
    $envioResult = $Object->enviarCorreo(
        $email,
        $usuario['nombre'] . ' ' . $usuario['apellido'],
        $tokenResult['token'],
        $configCorreo
    );

    if($envioResult['message'] === 'Good'){
        $JSON_RESULT['message'] = 'Good';
        $JSON_RESULT['info'] = 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña';
    } else {
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = $envioResult['error'];
    }

    echo json_encode($JSON_RESULT);

} catch(Exception $e){
    $JSON_RESULT['message'] = 'Bad';
    $JSON_RESULT['error'] = 'Error del servidor: ' . $e->getMessage();
    echo json_encode($JSON_RESULT);
}
/*</Controlador>*/

?>
