<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once('../model/administrador.model.cuestionarios.php');
use administrador\Modules\ModuleCuestionarios\Model\CuestionariosModel;

try {
    $modelo = new CuestionariosModel();
    $idUsuarioLogueado = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : null;

    switch ($_SERVER['REQUEST_METHOD']) {

        case 'GET':
            if (isset($_GET['id'])) {
                $id = intval($_GET['id']);
                $resultado = $modelo->getCuestionarioPublico($id);
                if (isset($resultado['success']) && $resultado['success'] === false) {
                    echo json_encode($resultado);
                } else {
                    echo json_encode(['success' => true, 'cuestionario' => $resultado]);
                }
            } else {
                $resultado = $modelo->getCuestionariosPublicados();
                if (isset($resultado['success']) && $resultado['success'] === false) {
                    echo json_encode($resultado);
                } else {
                    echo json_encode(['success' => true, 'cuestionarios' => $resultado]);
                }
            }
            break;

        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true);

            $idCuestionario = intval($body['idCuestionario'] ?? 0);
            $nombre         = !empty($body['nombre']) ? trim($body['nombre']) : null;
            $email          = !empty($body['email']) ? trim($body['email']) : null;
            $respuestas     = $body['respuestas'] ?? [];
            $respuestasTexto = $body['respuestasTexto'] ?? [];

            if ($idCuestionario <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de cuestionario requerido']);
                exit;
            }

            if (empty($respuestas) && empty($respuestasTexto)) {
                echo json_encode(['success' => false, 'error' => 'Las respuestas son obligatorias']);
                exit;
            }

            $resultado = $modelo->guardarRespuestas($idCuestionario, $nombre, $email, $respuestas, $respuestasTexto, $idUsuarioLogueado);
            echo json_encode($resultado);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
            break;
    }

} catch (\Throwable $e) {
    error_log('[Cuestionarios Publico] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
?>
