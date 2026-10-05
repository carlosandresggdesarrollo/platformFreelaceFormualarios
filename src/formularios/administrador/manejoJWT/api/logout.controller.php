<?php

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../model/jwt.model.php';

try {
    // El guardia ya abrio la sesion si venia cookie o un token valido.
    $idSesion = intval($_SESSION['administrador-idSesion'] ?? 0);

    if ($idSesion > 0) {
        $model = new JWTModel();
        $model->revocarRefreshToken($idSesion);
        $model->cerrarSesion($idSesion);
    }

    if (session_status() === PHP_SESSION_ACTIVE) {
        $_SESSION = [];
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        session_destroy();
    }

    echo json_encode(['message' => 'SESION_CERRADA']);

} catch (\Throwable $e) {
    error_log('[Logout] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}
