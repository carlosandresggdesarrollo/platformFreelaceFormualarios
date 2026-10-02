<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../model/administrador.model.analytics.php');

use administrador\Modules\ModuleAnalytics\Model\AnalyticsModel;

$idUsuario = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : 0;
if (!$idUsuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $modelo = new AnalyticsModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $vista = $_GET['vista'] ?? 'resumen';

        if ($vista === 'resumen') {
            $desde = $_GET['desde'] ?? date('Y-m-d', strtotime('-30 days'));
            $hasta = $_GET['hasta'] ?? date('Y-m-d');
            $data = $modelo->getResumen($desde, $hasta);
            echo json_encode(['success' => true, 'data' => $data, 'desde' => $desde, 'hasta' => $hasta]);
            exit;
        }

        if ($vista === 'recientes') {
            $limit = intval($_GET['limit'] ?? 50);
            $offset = intval($_GET['offset'] ?? 0);
            $data = $modelo->getVisitasRecientes($limit, $offset);
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        if ($vista === 'detalle') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $data = $modelo->getDetalleVisita($id);
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'Vista no reconocida']);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Analytics admin] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
