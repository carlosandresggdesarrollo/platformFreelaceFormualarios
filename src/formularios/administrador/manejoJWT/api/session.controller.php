<?php

header("Content-Type: application/json");

require_once __DIR__ . '/../model/jwt.model.php';

try {
    // El guardia ya valido la sesion (cookie o token).
    $idUsuario = intval($_SESSION['administrador-idUsuario']);

    $model = new JWTModel();
    $datos = $model->obtenerDatosUsuario($idUsuario);

    if (!$datos) {
        http_response_code(401);
        echo json_encode(['message' => 'USUARIO_INACTIVO']);
        exit;
    }

    echo json_encode([
        'message' => 'USUARIO_ACTIVO',
        'usuario' => [
            'idUsuario' => $datos['idUsuario'],
            'idSesion' => $_SESSION['administrador-idSesion'] ?? null,
            'nombre' => $datos['nombre'],
            'tipoUsuario' => $datos['tipoUsuario']
        ]
    ]);

} catch (\Throwable $e) {
    error_log('[Session] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}
