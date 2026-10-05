<?php
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Dashboard stats (sin id)
        if (!isset($_GET['id']) || $_GET['id'] === '') {
            $resultado = $modelo->getDashboardStats();
            echo json_encode($resultado);
            exit;
        }

        $id = intval($_GET['id']);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID de cuestionario requerido']);
            exit;
        }

        $resultado = $modelo->getEstadisticas($id);
        echo json_encode($resultado);
    } else {
        echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    }

} catch (\Throwable $e) {
    error_log('[Cuestionarios Stats] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
?>
