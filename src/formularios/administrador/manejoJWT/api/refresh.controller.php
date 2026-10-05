<?php

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/jwt.helper.php';
require_once __DIR__ . '/../model/jwt.model.php';

try {
    authLimitarIntentos('refresh-ip|' . authClientIp(), 120, 900);

    $input = json_decode(file_get_contents('php://input'), true);
    $refreshToken = is_string($input['refreshToken'] ?? null) ? $input['refreshToken'] : '';

    if ($refreshToken === '') {
        http_response_code(400);
        echo json_encode(['message' => 'REFRESH_TOKEN_REQUERIDO']);
        exit;
    }

    $resultado = JWTHelper::validarToken($refreshToken);

    if (!$resultado['valid']) {
        http_response_code(401);
        echo json_encode(['message' => $resultado['error']]);
        exit;
    }

    if ($resultado['type'] !== 'refresh') {
        http_response_code(401);
        echo json_encode(['message' => 'TOKEN_TIPO_INVALIDO']);
        exit;
    }

    $model = new JWTModel();

    $tokenValido = $model->validarRefreshToken($resultado['data']['idSesion'], $refreshToken);

    if (!$tokenValido) {
        http_response_code(401);
        echo json_encode(['message' => 'TOKEN_REVOCADO']);
        exit;
    }

    $userData = $model->obtenerDatosUsuario($resultado['data']['idUsuario']);

    if (!$userData) {
        http_response_code(401);
        echo json_encode(['message' => 'USUARIO_NO_ENCONTRADO']);
        exit;
    }

    $nuevoAccessToken = JWTHelper::generarAccessToken([
        'idUsuario' => $userData['idUsuario'],
        'idSesion' => $resultado['data']['idSesion'],
        'tipoUsuario' => $userData['tipoUsuario'],
        'navegador' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)
    ]);

    echo json_encode([
        'message' => 'Good',
        'accessToken' => $nuevoAccessToken,
        'expiresIn' => 900
    ]);

} catch (\Throwable $e) {
    error_log('[Refresh] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}
