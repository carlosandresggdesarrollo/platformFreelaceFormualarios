<?php
header('Content-Type: application/json');

require_once(__DIR__ . '/../model/administrador.model.usuario.php');

use administrador\Modules\ModulePerfil\Model\usuario\usuario;

// Cambio de contraseña obligatorio tras el primer login. Solo aplica al usuario de la sesion
// y solo mientras tenga la marca requiereCambioPass.
try {
    $body = json_decode(file_get_contents('php://input'), true);
    $nuevaContrasena = is_string($body['nuevaContrasena'] ?? null) ? $body['nuevaContrasena'] : '';

    if (strlen($nuevaContrasena) < 8) {
        echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres']);
        exit;
    }

    $ok = (new usuario())->cambiarPasswordObligatorio($nuevaContrasena);
    echo json_encode($ok ? ['success' => true] : ['success' => false, 'error' => 'No hay un cambio de contraseña pendiente']);
} catch (\Throwable $e) {
    error_log('[CambioPass] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
