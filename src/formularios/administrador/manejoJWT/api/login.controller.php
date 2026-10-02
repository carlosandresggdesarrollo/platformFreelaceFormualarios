<?php

// Debug temporal - QUITAR EN PRODUCCIÓN
ini_set('display_errors', 0);
error_reporting(E_ALL);

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
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Verificar que los archivos existen antes de incluirlos
    $jwtHelperPath = __DIR__ . '/jwt.helper.php';
    $modelPath = __DIR__ . '/../model/jwt.model.php';
    
    if (!file_exists($jwtHelperPath)) {
        throw new Exception("No se encuentra jwt.helper.php en: " . $jwtHelperPath);
    }
    
    if (!file_exists($modelPath)) {
        throw new Exception("No se encuentra jwt.model.php en: " . $modelPath);
    }
    
    require_once $jwtHelperPath;
    require_once $modelPath;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $usuario = $input['usuario'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($usuario) || empty($password)) {
        http_response_code(400);
        echo json_encode(['message' => 'CAMPOS_REQUERIDOS']);
        exit;
    }
    
    $model = new JWTModel();
    
    // Validar credenciales
    $resultado = $model->validarCredenciales($usuario, $password);
    
    if (!$resultado['valid']) {
        http_response_code(401);
        echo json_encode(['message' => 'CREDENCIALES_INVALIDAS']);
        exit;
    }
    
    // Crear sesión en BD
    $IP = isset($_SERVER['HTTP_CLIENT_IP']) 
        ? $_SERVER['HTTP_CLIENT_IP'] 
        : (isset($_SERVER['HTTP_X_FORWARDED_FOR']) 
            ? $_SERVER['HTTP_X_FORWARDED_FOR'] 
            : $_SERVER['REMOTE_ADDR']);
    
    $navegador = $_SERVER['HTTP_USER_AGENT'];
    
    $sesion = $model->crearSesion($resultado['idUsuario'], $IP, $navegador);
    
    if (!$sesion['success']) {
        http_response_code(500);
        echo json_encode(['message' => 'ERROR_CREAR_SESION']);
        exit;
    }
    
    // Generar tokens
    $userData = [
        'idUsuario' => $resultado['idUsuario'],
        'idSesion' => $sesion['idSesion'],
        'tipoUsuario' => $resultado['tipoUsuario'],
        'navegador' => $navegador
    ];

    $accessToken = JWTHelper::generarAccessToken($userData);
    $refreshToken = JWTHelper::generarRefreshToken($userData);

    // Guardar refresh token en BD
    $model->guardarRefreshToken($sesion['idSesion'], $refreshToken);

    // Establecer sesión PHP para compatibilidad con módulos legacy
    session_start();
    $_SESSION["administrador-idUsuario"] = $resultado['idUsuario'];
    $_SESSION["administrador-tipoUsuario"] = $resultado['tipoUsuario'];
    $_SESSION["administrador-nombre"] = $resultado['nombre'];
    $_SESSION["administrador-estatus"] = $resultado['estatus'];
    $_SESSION["administrador-imagen"] = $resultado['imagen'];

    // Registrar login para tracking de seguridad
    try {
        $clienteModelPath = __DIR__ . '/../../Modules/ModuleClienteDashboard/model/administrador.model.cliente.dashboard.php';
        if (file_exists($clienteModelPath)) {
            require_once $clienteModelPath;
            $loginTracker = new \administrador\Modules\ModuleClienteDashboard\Model\ClienteDashboardModel();
            $loginTracker->registrarLogin(intval($resultado['idUsuario']));
        }
    } catch (Exception $e) {
        // No bloquear login si falla el tracking
    }

    echo json_encode([
        'message' => 'Good',
        'accessToken' => $accessToken,
        'refreshToken' => $refreshToken,
        'expiresIn' => 900,
        'usuario' => [
            'id' => $resultado['idUsuario'],
            'nombre' => $resultado['nombre'],
            'tipo' => $resultado['tipoUsuario'],
            'estatus' => $resultado['estatus'],
            'imagen' => $resultado['imagen'],
            'email' => $resultado['email'] ?? '',
            'requiereCambioPass' => $resultado['requiereCambioPass'] ?? 0
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'ERROR_SERVIDOR', 
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Error $e) {
    // Capturar errores fatales de PHP 7
    http_response_code(500);
    echo json_encode([
        'message' => 'ERROR_FATAL', 
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
