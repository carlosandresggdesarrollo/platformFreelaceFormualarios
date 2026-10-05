<?php
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
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
    $body = json_decode(file_get_contents('php://input'), true);

    switch ($_SERVER['REQUEST_METHOD']) {

        case 'POST':
            $idCuestionario = intval($body['idCuestionario'] ?? 0);
            $texto          = trim($body['texto'] ?? '');
            $orden          = intval($body['orden'] ?? 0);
            $opciones       = $body['opciones'] ?? [];
            $tipo           = $body['tipo'] ?? 'opcion_multiple';

            if ($idCuestionario <= 0 || $texto === '') {
                echo json_encode(['success' => false, 'error' => 'ID de cuestionario y texto son obligatorios']);
                exit;
            }

            $resultado = $modelo->agregarPregunta($idCuestionario, $texto, $orden, $opciones, $tipo);
            echo json_encode($resultado);
            break;

        case 'PUT':
            $idPregunta = intval($body['idPregunta'] ?? 0);
            $texto      = trim($body['texto'] ?? '');
            $opciones   = $body['opciones'] ?? [];
            $tipo       = $body['tipo'] ?? 'opcion_multiple';

            if ($idPregunta <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de pregunta requerido']);
                exit;
            }

            $resultado = $modelo->actualizarPregunta($idPregunta, $texto, $opciones, $tipo);
            echo json_encode($resultado);
            break;

        case 'DELETE':
            $idPregunta = intval($body['idPregunta'] ?? 0);

            if ($idPregunta <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de pregunta requerido']);
                exit;
            }

            $resultado = $modelo->eliminarPregunta($idPregunta);
            echo json_encode($resultado);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
            break;
    }

} catch (\Throwable $e) {
    error_log('[Cuestionarios Preguntas] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
?>
