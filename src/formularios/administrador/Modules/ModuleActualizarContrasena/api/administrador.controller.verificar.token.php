<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once(__DIR__ . '/../model/administrador.model.correo.php');

use  administrador\Modules\ModuleActualizarContrasena\Model\correo\correo as correo;

try {
    authLimitarIntentos('recuperar-token|' . authClientIp(), 30, 900);

    $input = json_decode(file_get_contents('php://input'), true);
    $token = is_array($input) && isset($input['token']) ? $input['token'] : ($_GET['token'] ?? '');

    if (!is_string($token) || $token === '') {
        echo json_encode(['message' => 'Bad', 'error' => 'Token no proporcionado']);
        exit;
    }

    $resultado = (new correo())->verificarToken($token);
    unset($resultado['idUsuario']);
    echo json_encode($resultado);
} catch (\Throwable $e) {
    error_log('[Recuperar] ' . $e->getMessage());
    echo json_encode(['message' => 'Bad', 'error' => 'Error del servidor']);
}
