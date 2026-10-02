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

    // Obtener token del GET o POST
    $input = json_decode(file_get_contents('php://input'), true);
    $token = isset($input['token']) ? $input['token'] : (isset($_GET['token']) ? $_GET['token'] : '');

    if(empty($token)){
        $JSON_RESULT['message'] = 'Bad';
        $JSON_RESULT['error'] = 'Token no proporcionado';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // Verificar token
    $JSON_RESULT = $Object->verificarToken($token);

    echo json_encode($JSON_RESULT);

} catch(Exception $e){
    $JSON_RESULT['message'] = 'Bad';
    $JSON_RESULT['error'] = 'Error del servidor: ' . $e->getMessage();
    echo json_encode($JSON_RESULT);
}
/*</Controlador>*/

?>
