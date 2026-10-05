<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once(__DIR__ . '/../model/administrador.model.correo.php');

use  administrador\Modules\ModuleActualizarContrasena\Model\correo\correo as correo;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = is_array($input) && is_string($input['email'] ?? null) ? trim($input['email']) : (is_string($_POST['email'] ?? null) ? trim($_POST['email']) : '');

    if ($email === '') {
        echo json_encode(['message' => 'Bad', 'error' => 'El correo electrónico es requerido']);
        exit;
    }

    authLimitarIntentos('recuperar-ip|' . authClientIp(), 5, 3600);
    authLimitarIntentos('recuperar-email|' . strtolower($email), 3, 3600);

    (new correo())->solicitarRecuperacion($email);

    // Misma respuesta exista o no la cuenta: no se revela que correos estan registrados.
    echo json_encode([
        'message' => 'Good',
        'info' => 'Si el correo existe, recibirás un enlace de recuperación',
    ]);
} catch (\Throwable $e) {
    error_log('[Recuperar] ' . $e->getMessage());
    echo json_encode(['message' => 'Bad', 'error' => 'Error del servidor']);
}
