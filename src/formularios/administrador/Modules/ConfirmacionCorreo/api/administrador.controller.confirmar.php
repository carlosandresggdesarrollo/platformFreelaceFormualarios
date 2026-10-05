<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/*<Include classes>*/
    include_once(__DIR__ . '/../model/administrador.model.confirmacion.php');
/*</Include classes>*/

/*<Import>*/
use administrador\Modules\ConfirmacionCorreo\Model\confirmacion\confirmacion as confirmacion;

/*<Controlador>*/
$JSON_RESULT = [];

try {
    authLimitarIntentos('confirmar-correo|' . authClientIp(), 30, 900);

    /*<Instaciacion de objetos>*/
        $Object = new confirmacion();
    /*</Instaciacion de objetos>*/

    // Obtener token del GET o POST
    $input = json_decode(file_get_contents('php://input'), true);
    $token = isset($input['token']) ? $input['token'] : (isset($_GET['token']) ? $_GET['token'] : '');

    if(empty($token)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'Token no proporcionado';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // Paso 1: Verificar el token
    $verificacion = $Object->verificarToken($token);

    if($verificacion['message'] !== 'Good'){
        echo json_encode($verificacion);
        exit;
    }

    if($verificacion['idUsuario'] === 0){
        $JSON_RESULT['message'] = 'Good';
        $JSON_RESULT['confirmado'] = false;
        $JSON_RESULT['texto'] = 'El enlace no es válido o el usuario no existe.';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // Paso 2: Confirmar correo
    $confirmacion = $Object->confirmarCorreo($verificacion['idUsuario'], $verificacion['estatus']);

    // Agregar datos del usuario a la respuesta
    $confirmacion['usuario'] = [
        'nombre' => $verificacion['nombre'],
        'apellidos' => $verificacion['apellidos'],
        'email' => $verificacion['email']
    ];

    echo json_encode($confirmacion);

} catch(Exception $e){
    $JSON_RESULT['message'] = 'Bad';
    $JSON_RESULT['error'] = 'Error del servidor';
    echo json_encode($JSON_RESULT);
}
/*</Controlador>*/

?>
