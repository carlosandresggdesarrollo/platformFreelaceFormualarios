<?php

require_once __DIR__ . '/jwt.helper.php';

function verificarAutenticacion() {
    $token = JWTHelper::obtenerTokenDeHeader();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['message' => 'TOKEN_NO_PROPORCIONADO']);
        exit;
    }
    
    $resultado = JWTHelper::validarToken($token);
    
    if (!$resultado['valid']) {
        http_response_code(401);
        echo json_encode(['message' => $resultado['error']]);
        exit;
    }
    
    if ($resultado['type'] !== 'access') {
        http_response_code(401);
        echo json_encode(['message' => 'USAR_ACCESS_TOKEN']);
        exit;
    }
    
    return $resultado['data'];
}

function verificarRol($rolesPermitidos = []) {
    $usuario = verificarAutenticacion();
    
    if (!empty($rolesPermitidos) && !in_array($usuario['tipoUsuario'], $rolesPermitidos)) {
        http_response_code(403);
        echo json_encode(['message' => 'ACCESO_DENEGADO']);
        exit;
    }
    
    return $usuario;
}