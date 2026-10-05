<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../model/administrador.model.cliente.dashboard.php');
use administrador\Modules\ModuleClienteDashboard\Model\ClienteDashboardModel;

$idUsuario = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : 0;
if (!$idUsuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $modelo = new ClienteDashboardModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $vista = $_GET['vista'] ?? 'lista';

        if ($vista === 'lista') {
            $clientes = $modelo->getLoginStatsAdmin();
            $resumen = $modelo->getLoginResumen();
            echo json_encode([
                'success' => true,
                'clientes' => $clientes,
                'resumen' => $resumen,
            ]);
            exit;
        }

        if ($vista === 'historial') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $historial = $modelo->getLoginHistoryByUser($id);
            echo json_encode(['success' => true, 'historial' => $historial]);
            exit;
        }
    }

    echo json_encode(['success' => false, 'error' => 'Accion no valida']);

} catch (Exception $e) {
    http_response_code(500);
    error_log('[Backend] ' . $e->getMessage()); echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
