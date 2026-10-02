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
        $data = $modelo->getCarruseles();
        echo json_encode(['success' => true, 'carruseles' => $data['carruseles']]);
        exit;
    }

    if ($metodo === 'POST') {
        $accion = $_POST['accion'] ?? 'crear_item';

        // Renombrar un carrusel
        if ($accion === 'renombrar') {
            $id     = intval($_POST['idCarrusel'] ?? 0);
            $nombre = trim($_POST['nombre'] ?? '');
            if ($id <= 0 || $nombre === '') {
                echo json_encode(['success' => false, 'error' => 'ID y nombre requeridos']);
                exit;
            }
            $res = $modelo->updateCarrusel($id, $nombre);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'RENOMBRAR_CARRUSEL', 'carrusel', $id,
                    json_encode(['nombre' => $nombre]));
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error']);
            }
            exit;
        }

        // Cambiar velocidad del carrusel
        if ($accion === 'velocidad') {
            $id = intval($_POST['idCarrusel'] ?? 0);
            $velocidad = intval($_POST['velocidad'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $res = $modelo->updateCarruselVelocidad($id, $velocidad);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'VELOCIDAD_CARRUSEL', 'carrusel', $id,
                    json_encode(['velocidad' => $velocidad]));
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error']);
            }
            exit;
        }

        // Reordenar items
        if ($accion === 'reordenar') {
            $ids = json_decode($_POST['ids'] ?? '[]', true);
            if (!is_array($ids) || empty($ids)) {
                echo json_encode(['success' => false, 'error' => 'IDs requeridos']);
                exit;
            }
            $modelo->reorderCarruselItems($ids);
            $modelo->logAction($idUsuario, 'REORDENAR_ITEMS', 'carrusel_item', null, json_encode($ids));
            echo json_encode(['success' => true]);
            exit;
        }

        // Toggle activo/inactivo
        if ($accion === 'toggle') {
            $id = intval($_POST['idItem'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $res = $modelo->toggleCarruselItem($id);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'TOGGLE_ITEM', 'carrusel_item', $id, null);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error']);
            }
            exit;
        }

        // Actualizar item existente
        if ($accion === 'actualizar_item') {
            $idItem      = intval($_POST['idItem'] ?? 0);
            $titulo      = trim($_POST['titulo'] ?? '');
            $descripcion = $_POST['descripcion'] ?? null;
            $link        = !empty($_POST['link']) ? $_POST['link'] : null;
            $icono       = !empty($_POST['icono']) ? $_POST['icono'] : null;
            $orden       = intval($_POST['orden'] ?? 0);
            $activo      = intval($_POST['activo'] ?? 1);

            if ($idItem <= 0 || $titulo === '') {
                echo json_encode(['success' => false, 'error' => 'ID y titulo son obligatorios']);
                exit;
            }

            $imagenPath = null;
            if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                $upload = $modelo->uploadImage($_FILES['imagen']);
                if (!$upload['success']) {
                    echo json_encode(['success' => false, 'error' => $upload['error']]);
                    exit;
                }
                $imagenPath = $upload['path'];
            }

            $res = $modelo->updateCarruselItem($idItem, $titulo, $descripcion, $link, $imagenPath, $icono, $orden, $activo);
            if ($res['message'] === 'Good') {
                $modelo->logAction($idUsuario, 'ACTUALIZAR_ITEM', 'carrusel_item', $idItem,
                    json_encode(['titulo' => $titulo]));
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al actualizar']);
            }
            exit;
        }

        // Crear item
        $idCarrusel  = intval($_POST['idCarrusel'] ?? 0);
        $titulo      = trim($_POST['titulo'] ?? '');
        $descripcion = $_POST['descripcion'] ?? null;
        $link        = !empty($_POST['link']) ? $_POST['link'] : null;
        $icono       = !empty($_POST['icono']) ? $_POST['icono'] : null;
        $orden       = intval($_POST['orden'] ?? 0);

        if ($idCarrusel <= 0 || $titulo === '') {
            echo json_encode(['success' => false, 'error' => 'Carrusel y titulo son obligatorios']);
            exit;
        }

        $imagenPath = null;
        if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $upload = $modelo->uploadImage($_FILES['imagen']);
            if (!$upload['success']) {
                echo json_encode(['success' => false, 'error' => $upload['error']]);
                exit;
            }
            $imagenPath = $upload['path'];
        }

        $res = $modelo->createCarruselItem($idCarrusel, $titulo, $descripcion, $link, $imagenPath, $icono, $orden);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'CREAR_ITEM', 'carrusel_item', $res['idItem'],
                json_encode(['carrusel' => $idCarrusel, 'titulo' => $titulo]));
            echo json_encode(['success' => true, 'idItem' => $res['idItem']]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error al crear']);
        }
        exit;
    }

    if ($metodo === 'PUT') {
        // PUT con multipart no funciona nativamente — recibir como POST con accion=actualizar_item
        echo json_encode(['success' => false, 'error' => 'Usa POST con accion=actualizar_item']);
        exit;
    }

    if ($metodo === 'DELETE') {
        parse_str(file_get_contents('php://input'), $vars);
        $id = intval($vars['idItem'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID requerido']);
            exit;
        }
        $res = $modelo->deleteCarruselItem($id);
        if ($res['message'] === 'Good') {
            $modelo->logAction($idUsuario, 'ELIMINAR_ITEM', 'carrusel_item', $id, null);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $res['error'] ?? 'Error']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Home carruseles] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
