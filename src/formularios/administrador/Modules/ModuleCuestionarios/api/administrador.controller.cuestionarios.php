<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['administrador-idUsuario'])) {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}
$idUsuario = intval($_SESSION['administrador-idUsuario']);

require_once('../model/administrador.model.cuestionarios.php');
use administrador\Modules\ModuleCuestionarios\Model\CuestionariosModel;

try {
    $modelo = new CuestionariosModel();

    switch ($_SERVER['REQUEST_METHOD']) {

        case 'GET':
            if (isset($_GET['id'])) {
                $id = intval($_GET['id']);
                $resultado = $modelo->getCuestionario($id);
                if (isset($resultado['success']) && $resultado['success'] === false) {
                    echo json_encode($resultado);
                } else {
                    echo json_encode(['success' => true, 'cuestionario' => $resultado]);
                }
            } else {
                $resultado = $modelo->listarCuestionarios();
                if (isset($resultado['success']) && $resultado['success'] === false) {
                    echo json_encode($resultado);
                } else {
                    echo json_encode(['success' => true, 'cuestionarios' => $resultado]);
                }
            }
            break;

        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true);
            $titulo      = trim($body['titulo'] ?? '');
            $descripcion = trim($body['descripcion'] ?? '');

            if ($titulo === '') {
                echo json_encode(['success' => false, 'error' => 'El titulo es obligatorio']);
                exit;
            }

            $resultado = $modelo->crearCuestionario($titulo, $descripcion, $idUsuario);
            echo json_encode($resultado);
            break;

        case 'PUT':
            $body = json_decode(file_get_contents('php://input'), true);
            $id          = intval($body['id'] ?? 0);
            $titulo      = trim($body['titulo'] ?? '');
            $descripcion = trim($body['descripcion'] ?? '');
            $estado      = $body['estado'] ?? null;

            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de cuestionario requerido']);
                exit;
            }

            $resultado = $modelo->actualizarCuestionario($id, $titulo, $descripcion, $estado);
            echo json_encode($resultado);
            break;

        case 'DELETE':
            $body = json_decode(file_get_contents('php://input'), true);
            $id = intval($body['id'] ?? 0);

            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de cuestionario requerido']);
                exit;
            }

            $resultado = $modelo->eliminarCuestionario($id);
            echo json_encode($resultado);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
            break;
    }

} catch (\Throwable $e) {
    error_log('[Cuestionarios CRUD] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
?>
