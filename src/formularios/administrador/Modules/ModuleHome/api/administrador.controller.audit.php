<?php
header('Content-Type: application/json');
session_start();

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

    $limit  = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    $data = $modelo->getAuditLogs($limit, $offset);
    echo json_encode([
        'success' => true,
        'logs'    => $data['logs'],
        'total'   => $data['total'],
    ]);
} catch (\Throwable $e) {
    error_log('[Home audit] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
