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
        $data = $modelo->getModalConfig();
        echo json_encode(['success' => true, 'config' => $data['config'], 'contactos' => $data['contactos']]);
        exit;
    }

    if ($metodo === 'POST') {
        $accion = $_POST['accion'] ?? 'crear_contacto';

        if ($accion === 'actualizar_config') {
            $activo = intval($_POST['activo'] ?? 0);
            $textoAgradecimiento = isset($_POST['textoAgradecimiento']) && $_POST['textoAgradecimiento'] !== '' ? $_POST['textoAgradecimiento'] : null;
            $textoTerapeutas     = isset($_POST['textoTerapeutas']) && $_POST['textoTerapeutas'] !== '' ? $_POST['textoTerapeutas'] : null;
            $textoColaboradores  = isset($_POST['textoColaboradores']) && $_POST['textoColaboradores'] !== '' ? $_POST['textoColaboradores'] : null;
            $textoCursos         = isset($_POST['textoCursos']) && $_POST['textoCursos'] !== '' ? $_POST['textoCursos'] : null;
            $res = $modelo->updateModalConfig($activo, $textoAgradecimiento, $textoTerapeutas, $textoColaboradores, $textoCursos);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'ACTUALIZAR_MODAL_CONFIG', 'modal_bienvenida', 1, json_encode(['activo' => $activo]));
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error']);
            }
            exit;
        }

        if ($accion === 'toggle_contacto') {
            $id = intval($_POST['idContacto'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $res = $modelo->toggleModalContacto($id);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'TOGGLE_MODAL_CONTACTO', 'modal_contacto', $id, null);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error']);
            }
            exit;
        }

        if ($accion === 'actualizar_contacto') {
            $id     = intval($_POST['idContacto'] ?? 0);
            $nombre = trim($_POST['nombre'] ?? '');
            if ($id <= 0 || $nombre === '') {
                echo json_encode(['success' => false, 'error' => 'ID y nombre requeridos']);
                exit;
            }
            $desc   = isset($_POST['descripcion']) && $_POST['descripcion'] !== '' ? $_POST['descripcion'] : null;
            $tel    = isset($_POST['telefono']) && $_POST['telefono'] !== '' ? $_POST['telefono'] : null;
            $email  = isset($_POST['email']) && $_POST['email'] !== '' ? $_POST['email'] : null;
            $enlace = isset($_POST['enlace']) && $_POST['enlace'] !== '' ? $_POST['enlace'] : null;
            $enlaceTexto = isset($_POST['enlaceTexto']) && $_POST['enlaceTexto'] !== '' ? $_POST['enlaceTexto'] : null;
            $res = $modelo->updateModalContacto($id, $nombre, $desc, $tel, $email, $enlace, $enlaceTexto);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'ACTUALIZAR_MODAL_CONTACTO', 'modal_contacto', $id, json_encode(['nombre' => $nombre]));
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
            $modelo->reorderModalContactos($ids);
            $modelo->logAction($idUsuario, 'REORDENAR_MODAL_CONTACTOS', 'modal_contacto', null, json_encode($ids));
            echo json_encode(['success' => true]);
            exit;
        }

        // Crear contacto
        $tipo   = trim($_POST['tipo'] ?? 'colaborador');
        $nombre = trim($_POST['nombre'] ?? '');
        $orden  = intval($_POST['orden'] ?? 0);
        if ($nombre === '') {
            echo json_encode(['success' => false, 'error' => 'Nombre requerido']);
            exit;
        }
        $desc   = isset($_POST['descripcion']) && $_POST['descripcion'] !== '' ? $_POST['descripcion'] : null;
        $tel    = isset($_POST['telefono']) && $_POST['telefono'] !== '' ? $_POST['telefono'] : null;
        $email  = isset($_POST['email']) && $_POST['email'] !== '' ? $_POST['email'] : null;
        $enlace = isset($_POST['enlace']) && $_POST['enlace'] !== '' ? $_POST['enlace'] : null;
        $enlaceTexto = isset($_POST['enlaceTexto']) && $_POST['enlaceTexto'] !== '' ? $_POST['enlaceTexto'] : null;
        $res = $modelo->createModalContacto($tipo, $nombre, $desc, $tel, $email, $enlace, $enlaceTexto, $orden);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'CREAR_MODAL_CONTACTO', 'modal_contacto', $res['idContacto'],
                json_encode(['tipo' => $tipo, 'nombre' => $nombre]));
            echo json_encode(['success' => true, 'idContacto' => $res['idContacto']]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al crear']);
        }
        exit;
    }

    if ($metodo === 'DELETE') {
        parse_str(file_get_contents('php://input'), $vars);
        $id = intval($vars['idContacto'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID requerido']);
            exit;
        }
        $res = $modelo->deleteModalContacto($id);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ELIMINAR_MODAL_CONTACTO', 'modal_contacto', $id, null);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Home modal] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
