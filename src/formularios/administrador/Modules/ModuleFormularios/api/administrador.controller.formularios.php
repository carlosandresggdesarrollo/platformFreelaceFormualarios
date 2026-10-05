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

$rol = strtoupper((string) ($_SESSION['administrador-tipoUsuario'] ?? ''));
$esSupervisor = in_array($rol, ['ADMINISTRADOR', 'AUDITOR'], true);

function denegar(): void {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sin permiso']);
    exit;
}

/** Deja solo opciones bien formadas: texto no vacio (max 500) y bandera esCorrecta. */
function normalizarOpciones($opciones): array {
    $limpias = [];
    foreach (is_array($opciones) ? array_slice($opciones, 0, 50) : [] as $opc) {
        $texto = is_array($opc) && is_scalar($opc['texto'] ?? null) ? trim((string) $opc['texto']) : '';
        if ($texto === '') continue;
        $limpias[] = ['texto' => mb_substr($texto, 0, 500), 'esCorrecta' => !empty($opc['esCorrecta'])];
    }
    return $limpias;
}

try {
    $modelo = new FormulariosModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // El auditor solo consulta.
    if ($metodo !== 'GET' && $rol === 'AUDITOR') {
        denegar();
    }

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
            if (!$esSupervisor) denegar();
            $data = $modelo->getTodosFormularios();
            echo json_encode(['success' => true, 'formularios' => $data]);
            exit;
        }

        if ($vista === 'respuestas') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $sesiones = $modelo->getRespuestasIndividuales($id, $idUsuario);
            echo json_encode(['success' => true, 'sesiones' => $sesiones]);
            exit;
        }

        if ($vista === 'analitica') {
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $data = $modelo->getAnaliticaFormulario($id, $idUsuario);
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Formulario no encontrado']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        }

        if ($vista === 'estadisticas_admin') {
            if (!$esSupervisor) denegar();
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
        if (!is_array($input)) $input = [];
        $accion = $input['accion'] ?? '';
        // Los textos libres deben ser cadenas; cualquier otra cosa se trata como vacio.
        foreach (['titulo', 'descripcion', 'texto', 'estado'] as $campo) {
            if (isset($input[$campo]) && !is_string($input[$campo])) $input[$campo] = '';
        }

        if ($accion === 'crear') {
            $titulo = mb_substr(trim($input['titulo'] ?? ''), 0, 255);
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
            if ($id <= 0 || empty($titulo) || !in_array($estado, ['borrador', 'publicado', 'cerrado'], true)) {
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
            $opciones = normalizarOpciones($input['opciones'] ?? []);
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
            $opciones = normalizarOpciones($input['opciones'] ?? []);
            if ($idPregunta <= 0 || empty($texto)) {
                echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
                exit;
            }
            if (!$modelo->verificarPropietarioPregunta($idPregunta, $idUsuario)) {
                denegar();
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
            if (!$modelo->verificarPropietarioPregunta($idPregunta, $idUsuario)) {
                denegar();
            }
            $modelo->eliminarPregunta($idPregunta);
            echo json_encode(['success' => true]);
            exit;
        }

        if ($accion === 'toggle_participante') {
            $id = intval($input['idCuestionario'] ?? 0);
            $valor = !empty($input['crearParticipante']);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $ok = $modelo->actualizarCrearParticipante($id, $valor, $idUsuario);
            echo json_encode(['success' => $ok]);
            exit;
        }

        if ($accion === 'personalizar') {
            $id = intval($input['idCuestionario'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $campos = [];
            foreach (['tema', 'colorPrimario', 'colorFondo', 'imagenFondo', 'musicaUrl', 'musicaTipo', 'opacidadFondo'] as $k) {
                if (array_key_exists($k, $input)) $campos[$k] = $input[$k];
            }
            $ok = $modelo->actualizarPersonalizacion($id, $campos, $idUsuario);
            echo json_encode(['success' => $ok]);
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
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
