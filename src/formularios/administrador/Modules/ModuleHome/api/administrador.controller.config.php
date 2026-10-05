<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../model/administrador.model.home.php');

use administrador\Modules\ModuleHome\Model\HomeModel;

$idUsuario = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : 0;
if (!$idUsuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $modelo = new HomeModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $data = $modelo->getConfig();
        echo json_encode(['success' => true, 'config' => $data['config']]);
        exit;
    }

    if ($metodo === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $accion = $input['accion'] ?? '';
        if ($accion === 'toggleRegistro') {
            $res = $modelo->toggleRegistro();
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'TOGGLE_REGISTRO', 'config', 1,
                    json_encode(['registroActivo' => $res['registroActivo']]));
                echo json_encode(['success' => true, 'registroActivo' => $res['registroActivo']]);
            } else {
                echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error']);
            }
            exit;
        }
        echo json_encode(['success' => false, 'error' => 'Accion no valida']);
        exit;
    }

    if ($metodo === 'POST') {
        $titulo   = $_POST['tituloPrincipal'] ?? '';
        $subtitulo = $_POST['subtitulo'] ?? '';
        $tema     = isset($_POST['tema']) ? $_POST['tema'] : null;
        $animacionFondo = isset($_POST['animacionFondo']) ? $_POST['animacionFondo'] : null;
        $animacionCarga = isset($_POST['animacionCarga']) ? $_POST['animacionCarga'] : null;
        $animacionDuracion = isset($_POST['animacionDuracion']) ? intval($_POST['animacionDuracion']) : null;
        $animacionColor = isset($_POST['animacionColor']) ? $_POST['animacionColor'] : null;
        $nombreSitio = isset($_POST['nombreSitio']) ? $_POST['nombreSitio'] : null;
        $imagenPath = null;

        if (!empty($_FILES['imagenFondo']) && $_FILES['imagenFondo']['error'] === UPLOAD_ERR_OK) {
            $upload = $modelo->uploadImage($_FILES['imagenFondo']);
            if (!$upload['success']) {
                echo json_encode(['success' => false, 'error' => $upload['error']]);
                exit;
            }
            $imagenPath = $upload['path'];
        }

        $res = $modelo->updateConfig($titulo, $subtitulo, $imagenPath, $tema, $animacionFondo, $animacionCarga, $animacionDuracion, $animacionColor, $nombreSitio);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ACTUALIZAR_CONFIG', 'config', 1,
                json_encode(['titulo' => $titulo, 'subtitulo' => $subtitulo, 'imagen' => $imagenPath, 'tema' => $tema, 'animacion' => $animacionFondo]));
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al actualizar']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Home config] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
