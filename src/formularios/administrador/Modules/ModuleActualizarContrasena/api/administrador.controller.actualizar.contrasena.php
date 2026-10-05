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
    $token = is_array($input) && is_string($input['token'] ?? null) ? $input['token'] : '';
    $nuevaContrasena = is_array($input) && is_string($input['contrasena'] ?? null) ? $input['contrasena'] : '';

    $error = '';
    if ($token === '') {
        $error = 'Token no proporcionado';
    } elseif (strlen($nuevaContrasena) < 8 || strlen($nuevaContrasena) > 100) {
        $error = 'La contraseña debe tener entre 8 y 100 caracteres';
    } elseif (!preg_match('/[A-Z]/', $nuevaContrasena)) {
        $error = 'La contraseña debe tener al menos una mayúscula';
    } elseif (!preg_match('/[a-z]/', $nuevaContrasena)) {
        $error = 'La contraseña debe tener al menos una minúscula';
    } elseif (!preg_match('/[0-9]/', $nuevaContrasena)) {
        $error = 'La contraseña debe tener al menos un número';
    }
    if ($error !== '') {
        echo json_encode(['message' => 'Bad', 'error' => $error]);
        exit;
    }

    $resultado = (new correo())->actualizarContrasena($token, $nuevaContrasena);
    unset($resultado['idUsuario']);
    echo json_encode($resultado);
} catch (\Throwable $e) {
    error_log('[Recuperar] ' . $e->getMessage());
    echo json_encode(['message' => 'Bad', 'error' => 'Error del servidor']);
}
