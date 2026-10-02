<?php

header("Access-Control-Allow-Origin: http://localhost:3039");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'jwt.helper.php';
require_once '../model/jwt.model.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $refreshToken = $input['refreshToken'] ?? '';
    
    if (empty($refreshToken)) {
        http_response_code(400);
        echo json_encode(['message' => 'REFRESH_TOKEN_REQUERIDO']);
        exit;
    }
    
    // Validar refresh token
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
    
    // Verificar en BD que no esté revocado
    $tokenValido = $model->validarRefreshToken($resultado['data']['idSesion'], $refreshToken);
    
    if (!$tokenValido) {
        http_response_code(401);
        echo json_encode(['message' => 'TOKEN_REVOCADO']);
        exit;
    }
    
    // Obtener datos actualizados
    $userData = $model->obtenerDatosUsuario($resultado['data']['idUsuario']);
    
    if (!$userData) {
        http_response_code(401);
        echo json_encode(['message' => 'USUARIO_NO_ENCONTRADO']);
        exit;
    }
    
    // Generar nuevo access token
    $nuevoAccessToken = JWTHelper::generarAccessToken([
        'idUsuario' => $userData['idUsuario'],
        'idSesion' => $resultado['data']['idSesion'],
        'tipoUsuario' => $userData['tipoUsuario'],
        'navegador' => $_SERVER['HTTP_USER_AGENT']
    ]);
    
    echo json_encode([
        'message' => 'Good',
        'accessToken' => $nuevoAccessToken,
        'expiresIn' => 900
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}