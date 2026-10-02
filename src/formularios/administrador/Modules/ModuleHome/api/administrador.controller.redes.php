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
        $data = $modelo->getRedesSociales();
        echo json_encode(['success' => true, 'redes' => $data['redes']]);
        exit;
    }

    if ($metodo === 'POST') {
        $accion = $_POST['accion'] ?? 'crear';

        if ($accion === 'toggle') {
            $id = intval($_POST['idRed'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $res = $modelo->toggleRedSocial($id);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'TOGGLE_RED', 'red_social', $id, null);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error']);
            }
            exit;
        }

        if ($accion === 'actualizar') {
            $id     = intval($_POST['idRed'] ?? 0);
            $nombre = trim($_POST['nombre'] ?? '');
            $icono  = trim($_POST['icono'] ?? 'mdi:link');
            $url    = trim($_POST['url'] ?? '#');
            if ($id <= 0 || $nombre === '') {
                echo json_encode(['success' => false, 'error' => 'ID y nombre requeridos']);
                exit;
            }
            $res = $modelo->updateRedSocial($id, $nombre, $icono, $url);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'ACTUALIZAR_RED', 'red_social', $id,
                    json_encode(['nombre' => $nombre, 'url' => $url]));
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error']);
            }
            exit;
        }

        if ($accion === 'reordenar') {
            $ids = json_decode($_POST['ids'] ?? '[]', true);
            if (!is_array($ids) || empty($ids)) {
                echo json_encode(['success' => false, 'error' => 'IDs requeridos']);
                exit;
            }
            $modelo->reorderRedesSociales($ids);
            $modelo->logAction($idUsuario, 'REORDENAR_REDES', 'red_social', null, json_encode($ids));
            echo json_encode(['success' => true]);
            exit;
        }

        // Crear
        $nombre = trim($_POST['nombre'] ?? '');
        $icono  = trim($_POST['icono'] ?? 'mdi:link');
        $url    = trim($_POST['url'] ?? '#');
        $orden  = intval($_POST['orden'] ?? 0);
        if ($nombre === '') {
            echo json_encode(['success' => false, 'error' => 'Nombre requerido']);
            exit;
        }
        $res = $modelo->createRedSocial($nombre, $icono, $url, $orden);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'CREAR_RED', 'red_social', $res['idRed'],
                json_encode(['nombre' => $nombre, 'url' => $url]));
            echo json_encode(['success' => true, 'idRed' => $res['idRed']]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al crear']);
        }
        exit;
    }

    if ($metodo === 'DELETE') {
        parse_str(file_get_contents('php://input'), $vars);
        $id = intval($vars['idRed'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID requerido']);
            exit;
        }
        $res = $modelo->deleteRedSocial($id);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ELIMINAR_RED', 'red_social', $id, null);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Home redes] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
