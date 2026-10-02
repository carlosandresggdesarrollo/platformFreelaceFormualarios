<?php
header('Content-Type: application/json');
session_start();

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
        $data = $modelo->getNavItems();
        echo json_encode(['success' => true, 'items' => $data['items']]);
        exit;
    }

    if ($metodo === 'POST') {
        $accion = $_POST['accion'] ?? 'crear';

        if ($accion === 'reordenar') {
            $ids = json_decode($_POST['ids'] ?? '[]', true);
            if (!is_array($ids) || empty($ids)) {
                echo json_encode(['success' => false, 'error' => 'IDs requeridos']);
                exit;
            }
            $res = $modelo->reorderNav($ids);
            $modelo->logAction($idUsuario, 'REORDENAR_NAV', 'nav', null, json_encode($ids));
            echo json_encode(['success' => true]);
            exit;
        }

        $texto = trim($_POST['texto'] ?? '');
        $link  = trim($_POST['link'] ?? '#');
        $orden = intval($_POST['orden'] ?? 0);

        if ($texto === '') {
            echo json_encode(['success' => false, 'error' => 'El texto es obligatorio']);
            exit;
        }

        $res = $modelo->createNavItem($texto, $link, $orden);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'CREAR_NAV', 'nav', $res['idNav'],
                json_encode(['texto' => $texto, 'link' => $link]));
            echo json_encode(['success' => true, 'idNav' => $res['idNav']]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al crear']);
        }
        exit;
    }

    if ($metodo === 'PUT') {
        parse_str(file_get_contents('php://input'), $vars);
        $id    = intval($vars['idNav'] ?? 0);
        $texto = trim($vars['texto'] ?? '');
        $link  = trim($vars['link'] ?? '#');
        $orden = intval($vars['orden'] ?? 0);

        if ($id <= 0 || $texto === '') {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
            exit;
        }

        $res = $modelo->updateNavItem($id, $texto, $link, $orden);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ACTUALIZAR_NAV', 'nav', $id,
                json_encode(['texto' => $texto, 'link' => $link]));
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al actualizar']);
        }
        exit;
    }

    if ($metodo === 'DELETE') {
        parse_str(file_get_contents('php://input'), $vars);
        $id = intval($vars['idNav'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID requerido']);
            exit;
        }
        $res = $modelo->deleteNavItem($id);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ELIMINAR_NAV', 'nav', $id, null);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al eliminar']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Home nav] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
