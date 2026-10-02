<?php
header("Access-Control-Allow-Origin: http://localhost:3039");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Manejar preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once('../model/administrador.model.session.php');
use administrador\Main\Model\Session\Session;

try {
    session_start();
    $Object = new Session();
    $JSON_RESULT = [];

    // Función para crear nueva sesión (evita duplicación)
    $crearNuevaSesion = function() use ($Object, &$JSON_RESULT) {
        $IP = $_SERVER['HTTP_CLIENT_IP'] 
            ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
            ?? $_SERVER['REMOTE_ADDR'];
        
        $NAVEGADOR = $Object->getBrowser($_SERVER['HTTP_USER_AGENT']);
        $timestamp = date('Ymdhis');
        
        $GUI = base64_encode($IP . $NAVEGADOR . ($timestamp * date('his')));
        $SESSION = base64_encode($IP . $NAVEGADOR . date('Y-m-d h:i:s') . "door2door");
        $TOKEN = base64_encode($IP . $NAVEGADOR . $timestamp);

        $_SESSION['administrador-navegador'] = $NAVEGADOR;
        $_SESSION['administrador-gui'] = $GUI;
        $_SESSION['administrador-session'] = $SESSION;
        $_SESSION['administrador-token'] = $TOKEN;

        $result = $Object->INSERTA_NUEVA_SESSION($SESSION, $NAVEGADOR, $GUI, $TOKEN);
        
        $JSON_RESULT['message'] = ($result['message'] === 'Good') ? 'Good' : 'ERROR SISTEMA';
        $JSON_RESULT['RESULT_PASO_6'] = $result;
        
        return $result['message'] === 'Good';
    };

    // PASO 1: Verificar sesión en memoria
    if (!isset($_SESSION['administrador-session'])) {
        $crearNuevaSesion();
        echo json_encode($JSON_RESULT);
        exit;
    }

    // PASO 2: Consultar tabla sesiones
    $RESULT_PASO_2 = $Object->CONSULTAR_TABLA_SESSIONES($_SESSION['administrador-session']);
    $JSON_RESULT['RESULT_PASO_2'] = $RESULT_PASO_2;

    if ($RESULT_PASO_2['message'] !== 'Good') {
        $JSON_RESULT['message'] = 'ERROR SISTEMA';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if ($RESULT_PASO_2['information'] !== "EXISTE LA SESION") {
        $crearNuevaSesion();
        echo json_encode($JSON_RESULT);
        exit;
    }

    $ID_SESSION = $RESULT_PASO_2['ID_SESSION'];

    // PASO 3: Consultar relación sesiones
    $RESULT_PASO_3 = $Object->CONSULTAR_TABLA_RELACION_SESSIONES($ID_SESSION);
    $JSON_RESULT['RESULT_PASO_3'] = $RESULT_PASO_3;

    if ($RESULT_PASO_3['message'] !== 'Good') {
        $JSON_RESULT['message'] = 'ERROR SISTEMA';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if ($RESULT_PASO_3['information'] !== "EXISTE LA SESION") {
        $JSON_RESULT['message'] = 'Good';
        echo json_encode($JSON_RESULT);
        exit;
    }

    $ID_USUARIO = $RESULT_PASO_3['ID_USUARIO'];
    $ID_RxU = $RESULT_PASO_3['ID_RxU'];

    // PASO 4: Consultar usuarios activos
    $RESULT_PASO_4 = $Object->CONSULTAR_TABLA_USUARIOS_ACTIVOS($ID_USUARIO);
    $JSON_RESULT['RESULT_PASO_4'] = $RESULT_PASO_4;

    if ($RESULT_PASO_4['message'] === 'Good' && $RESULT_PASO_4['information'] === "EXISTE USUARIO ACTIVO") {
        $RESULT_PASO_4['idRuxs'] = $ID_RxU;
        $RESULT_PASO_4['idUsuario'] = $ID_USUARIO;
        $RESULT_PASO_4['tipoUsuario'] = $RESULT_PASO_3['tipoUsuario'];
        $RESULT_PASO_4['estatus'] = $RESULT_PASO_3['estatus'];
        $RESULT_PASO_4['sesion'] = $RESULT_PASO_3['sesion'];
        $RESULT_PASO_4['idSesion'] = $ID_SESSION;
        
        $JSON_RESULT['RESULT_PASO_4'] = $RESULT_PASO_4;
        $JSON_RESULT['message'] = 'USUARIO ACTIVO';
        echo json_encode($JSON_RESULT);
        exit;
    }

    if ($RESULT_PASO_4['message'] !== 'Good') {
        $JSON_RESULT['message'] = 'ERROR SISTEMA';
        echo json_encode($JSON_RESULT);
        exit;
    }

    // PASO 5: Actualizar relación sesiones
    $RESULT_PASO_5 = $Object->ACTUALIZAR_RELACION_SESSIONES($ID_RxU);
    $JSON_RESULT['RESULT_PASO_5'] = $RESULT_PASO_5;
    $JSON_RESULT['message'] = ($RESULT_PASO_5['message'] === 'Good') ? 'USUARIO INVALIDO' : 'ERROR SISTEMA';

    echo json_encode($JSON_RESULT);

} catch (Exception $e) {
    echo json_encode(['message' => 'Error servidor', 'error' => $e->getMessage()]);
}