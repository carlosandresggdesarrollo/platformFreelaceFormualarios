<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../model/administrador.model.home.php');

use administrador\Modules\ModuleHome\Model\HomeModel;

$idUsuario = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : 0;
if (!$idUsuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $modelo = new HomeModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $data = $modelo->getConfig();
        echo json_encode(['success' => true, 'logo' => $data['config']['logo'] ?? null]);
        exit;
    }

    if ($metodo === 'POST') {
        if (empty($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'error' => 'Archivo de logo requerido']);
            exit;
        }

        $upload = $modelo->uploadImage($_FILES['logo']);
        if (!$upload['success']) {
            echo json_encode(['success' => false, 'error' => $upload['error']]);
            exit;
        }

        $res = $modelo->updateLogo($upload['path']);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ACTUALIZAR_LOGO', 'config', 1,
                json_encode(['logo' => $upload['path']]));
            echo json_encode(['success' => true, 'logo' => $upload['path']]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al actualizar logo']);
        }
        exit;
    }

    if ($metodo === 'DELETE') {
        $res = $modelo->updateLogo(null);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ELIMINAR_LOGO', 'config', 1, null);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al eliminar logo']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Home logo] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
