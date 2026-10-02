<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../model/administrador.model.formularios.php');

use administrador\Modules\ModuleFormularios\Model\FormulariosModel;

$idUsuario = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : 0;
if (!$idUsuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $modelo = new FormulariosModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // ================================================================
    //  GET — List forms or get one
    // ================================================================
    if ($metodo === 'GET') {
        $vista = $_GET['vista'] ?? 'formularios';

        if ($vista === 'formularios') {
            $data = $modelo->getMisFormularios($idUsuario);
            echo json_encode(['success' => true, 'formularios' => $data]);
            exit;
        }

        if ($vista === 'formulario') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $data = $modelo->getFormulario($id, $idUsuario);
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Formulario no encontrado']);
                exit;
            }
            echo json_encode(['success' => true, 'formulario' => $data]);
            exit;
        }

        if ($vista === 'dashboard') {
            $data = $modelo->getDashboard($idUsuario);
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        if ($vista === 'estadisticas') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $data = $modelo->getEstadisticasFormulario($id, $idUsuario);
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Formulario no encontrado']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        if ($vista === 'todos') {
            $data = $modelo->getTodosFormularios();
            echo json_encode(['success' => true, 'formularios' => $data]);
            exit;
        }

        if ($vista === 'estadisticas_admin') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $data = $modelo->getEstadisticasFormularioAdmin($id);
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Formulario no encontrado']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'Vista no reconocida']);
        exit;
    }

    // ================================================================
    //  POST — Create form, add/update questions
    // ================================================================
    if ($metodo === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $accion = $input['accion'] ?? '';

        if ($accion === 'crear') {
            $titulo = trim($input['titulo'] ?? '');
            $descripcion = trim($input['descripcion'] ?? '');
            if (empty($titulo)) {
                echo json_encode(['success' => false, 'error' => 'Titulo requerido']);
                exit;
            }
            $data = $modelo->crearFormulario($titulo, $descripcion, $idUsuario);
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        if ($accion === 'actualizar') {
            $id = intval($input['idCuestionario'] ?? 0);
            $titulo = trim($input['titulo'] ?? '');
            $descripcion = trim($input['descripcion'] ?? '');
            $estado = $input['estado'] ?? 'borrador';
            if ($id <= 0 || empty($titulo)) {
                echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
                exit;
            }
            $ok = $modelo->actualizarFormulario($id, $titulo, $descripcion, $estado, $idUsuario);
            echo json_encode(['success' => $ok]);
            exit;
        }

        if ($accion === 'agregar_pregunta') {
            $idCuestionario = intval($input['idCuestionario'] ?? 0);
            $texto = trim($input['texto'] ?? '');
            $orden = intval($input['orden'] ?? 0);
            $opciones = $input['opciones'] ?? [];
            if ($idCuestionario <= 0 || empty($texto)) {
                echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
                exit;
            }
            if (!$modelo->verificarPropietario($idCuestionario, $idUsuario)) {
                echo json_encode(['success' => false, 'error' => 'Sin permiso']);
                exit;
            }
            $idPregunta = $modelo->agregarPregunta($idCuestionario, $texto, $orden, $opciones);
            echo json_encode(['success' => true, 'idPregunta' => $idPregunta]);
            exit;
        }

        if ($accion === 'actualizar_pregunta') {
            $idPregunta = intval($input['idPregunta'] ?? 0);
            $texto = trim($input['texto'] ?? '');
            $opciones = $input['opciones'] ?? [];
            if ($idPregunta <= 0 || empty($texto)) {
                echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
                exit;
            }
            $modelo->actualizarPregunta($idPregunta, $texto, $opciones);
            echo json_encode(['success' => true]);
            exit;
        }

        if ($accion === 'eliminar_pregunta') {
            $idPregunta = intval($input['idPregunta'] ?? 0);
            if ($idPregunta <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $modelo->eliminarPregunta($idPregunta);
            echo json_encode(['success' => true]);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'Accion no reconocida']);
        exit;
    }

    // ================================================================
    //  DELETE — Delete form
    // ================================================================
    if ($metodo === 'DELETE') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = intval($input['idCuestionario'] ?? $_GET['id'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID requerido']);
            exit;
        }
        $ok = $modelo->eliminarFormulario($id, $idUsuario);
        echo json_encode(['success' => $ok]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Formularios] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
