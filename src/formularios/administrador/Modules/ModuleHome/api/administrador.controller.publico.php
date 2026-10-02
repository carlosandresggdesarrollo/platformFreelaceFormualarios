<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../model/administrador.model.home.php');

use administrador\Modules\ModuleHome\Model\HomeModel;

try {
    $modelo = new HomeModel();
    $data = $modelo->getPublicData();
    echo json_encode($data);
} catch (\Throwable $e) {
    error_log('[Home publico] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
