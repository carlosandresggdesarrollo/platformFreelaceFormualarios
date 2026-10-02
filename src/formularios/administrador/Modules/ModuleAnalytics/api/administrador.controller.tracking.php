<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once(__DIR__ . '/../model/administrador.model.analytics.php');

use administrador\Modules\ModuleAnalytics\Model\AnalyticsModel;

try {
    $modelo = new AnalyticsModel();
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !is_array($input)) {
        echo json_encode(['success' => false, 'error' => 'Datos invalidos']);
        exit;
    }

    $accion = $input['accion'] ?? '';

    if ($accion === 'visita') {
        $pagina = trim($input['pagina'] ?? '/');
        $referrer = $input['referrer'] ?? null;
        $idioma = $input['idioma'] ?? null;
        $resolucion = $input['resolucion'] ?? null;
        $res = $modelo->registrarVisita($pagina, $referrer, $idioma, $resolucion);
        echo json_encode(['success' => true, 'idVisita' => $res['idVisita']]);
        exit;
    }

    if ($accion === 'actualizar') {
        $idVisita = intval($input['idVisita'] ?? 0);
        if ($idVisita <= 0) {
            echo json_encode(['success' => false]);
            exit;
        }
        $duracion = intval($input['duracion'] ?? 0);
        $scrollMax = intval($input['scrollMax'] ?? 0);
        $modelo->actualizarVisita($idVisita, $duracion, $scrollMax);

        $eventos = $input['eventos'] ?? [];
        if (!empty($eventos)) {
            $modelo->registrarEventosBatch($idVisita, $eventos);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    if ($accion === 'evento') {
        $idVisita = intval($input['idVisita'] ?? 0);
        if ($idVisita <= 0) {
            echo json_encode(['success' => false]);
            exit;
        }
        $tipo = $input['tipo'] ?? '';
        $detalle = $input['detalle'] ?? null;
        $valor = intval($input['valor'] ?? 0);
        $modelo->registrarEvento($idVisita, $tipo, $detalle, $valor);
        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Accion no reconocida']);
} catch (\Throwable $e) {
    error_log('[Analytics tracking] ' . $e->getMessage());
    echo json_encode(['success' => false]);
}
