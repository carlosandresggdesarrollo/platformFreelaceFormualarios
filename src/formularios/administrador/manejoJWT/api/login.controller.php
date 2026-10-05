<?php

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    require_once __DIR__ . '/jwt.helper.php';
    require_once __DIR__ . '/../model/jwt.model.php';

    $input = json_decode(file_get_contents('php://input'), true);

    $usuario = is_string($input['usuario'] ?? null) ? trim($input['usuario']) : '';
    $password = is_string($input['password'] ?? null) ? $input['password'] : '';

    if ($usuario === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['message' => 'CAMPOS_REQUERIDOS']);
        exit;
    }

    $IP = authClientIp();
    authLimitarIntentos('login-ip|' . $IP, 30, 900);
    authLimitarIntentos('login-usuario|' . strtolower($usuario), 8, 900);

    $model = new JWTModel();

    $resultado = $model->validarCredenciales($usuario, $password);

    if (!$resultado['valid']) {
        http_response_code(401);
        echo json_encode(['message' => 'CREDENCIALES_INVALIDAS']);
        exit;
    }

    $navegador = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

    $sesion = $model->crearSesion($resultado['idUsuario'], $IP, $navegador);

    if (!$sesion['success']) {
        http_response_code(500);
        echo json_encode(['message' => 'ERROR_CREAR_SESION']);
        exit;
    }

    $userData = [
        'idUsuario' => $resultado['idUsuario'],
        'idSesion' => $sesion['idSesion'],
        'tipoUsuario' => $resultado['tipoUsuario'],
        'navegador' => $navegador
    ];

    $accessToken = JWTHelper::generarAccessToken($userData);
    $refreshToken = JWTHelper::generarRefreshToken($userData);

    $model->guardarRefreshToken($sesion['idSesion'], $refreshToken);

    // Sesion PHP para la web. Se regenera el id para que no se reutilice uno previo al login.
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_regenerate_id(true);
    $_SESSION = [];
    $_SESSION["administrador-idUsuario"] = $resultado['idUsuario'];
    $_SESSION["administrador-tipoUsuario"] = $resultado['tipoUsuario'];
    $_SESSION["administrador-idSesion"] = $sesion['idSesion'];
    $_SESSION["administrador-nombre"] = $resultado['nombre'];
    $_SESSION["administrador-estatus"] = $resultado['estatus'];
    $_SESSION["administrador-imagen"] = $resultado['imagen'];
    $_SESSION["administrador-session"] = true;

    try {
        $clienteModelPath = __DIR__ . '/../../Modules/ModuleClienteDashboard/model/administrador.model.cliente.dashboard.php';
        if (file_exists($clienteModelPath)) {
            require_once $clienteModelPath;
            $loginTracker = new \administrador\Modules\ModuleClienteDashboard\Model\ClienteDashboardModel();
            $loginTracker->registrarLogin(intval($resultado['idUsuario']));
        }
    } catch (\Throwable $e) {
        // El tracking no debe bloquear el login
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

} catch (\Throwable $e) {
    error_log('[Login] ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    echo json_encode(['message' => 'ERROR_SERVIDOR']);
}
