<?php

$allowed_origins = [
     'http://10.1.19.24',
    'https://whatsapp.coeficiente.mx',
    'http://whatsapp.coeficiente.mx',
    'http://localhost:3039'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://whatsapp.coeficiente.mx");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once   '/middleware.auth.php';
require_once   '../model/jwt.model.php';

try {
    $usuario = verificarAutenticacion();
    
    $model = new JWTModel();
    
    // Verificar que el usuario siga activo
    $activo = $model->verificarUsuarioActivo($usuario['idUsuario']);
    
    if (!$activo) {
        http_response_code(401);
        echo json_encode(['message' => 'USUARIO_INACTIVO']);
        exit;
    }
    
    // Obtener datos completos
    $datos = $model->obtenerDatosUsuario($usuario['idUsuario']);
    
    echo json_encode([
        'message' => 'USUARIO_ACTIVO',
        'usuario' => [
            'idUsuario' => $datos['idUsuario'],
            'idSesion' => $usuario['idSesion'],
            'nombre' => $datos['nombre'],
            'tipoUsuario' => $datos['tipoUsuario']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}