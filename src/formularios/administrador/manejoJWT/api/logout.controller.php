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
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/jwt.helper.php';
require_once __DIR__ . '/../model/jwt.model.php';

try {
    $usuario = verificarAutenticacion();
    
    $model = new JWTModel();
    
    // Revocar todos los refresh tokens de esta sesión
    $model->revocarRefreshToken($usuario['idSesion']);
    
    // Opcional: cerrar sesión en BD
    $model->cerrarSesion($usuario['idSesion']);
    
    echo json_encode(['message' => 'SESION_CERRADA']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}