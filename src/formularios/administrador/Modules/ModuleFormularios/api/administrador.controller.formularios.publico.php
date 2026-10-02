<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once(__DIR__ . '/../model/administrador.model.formularios.php');

use administrador\Modules\ModuleFormularios\Model\FormulariosModel;

try {
    $modelo = new FormulariosModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // ================================================================
    //  GET — Load form by token, or catalogs
    // ================================================================
    if ($metodo === 'GET') {
        $vista = $_GET['vista'] ?? '';

        if ($vista === 'paises') {
            echo json_encode(['success' => true, 'paises' => $modelo->getPaises()]);
            exit;
        }
        if ($vista === 'estados') {
            $idPais = intval($_GET['idPais'] ?? 0);
            if ($idPais <= 0) { echo json_encode(['success' => false, 'error' => 'idPais requerido']); exit; }
            echo json_encode(['success' => true, 'estados' => $modelo->getEstados($idPais)]);
            exit;
        }
        if ($vista === 'municipios') {
            $idEstado = intval($_GET['idEstado'] ?? 0);
            if ($idEstado <= 0) { echo json_encode(['success' => false, 'error' => 'idEstado requerido']); exit; }
            echo json_encode(['success' => true, 'municipios' => $modelo->getMunicipios($idEstado)]);
            exit;
        }

        $token = $_GET['token'] ?? '';
        if (empty($token)) {
            echo json_encode(['success' => false, 'error' => 'Token requerido']);
            exit;
        }
        $form = $modelo->getFormularioByToken($token);
        if (!$form) {
            echo json_encode(['success' => false, 'error' => 'Formulario no encontrado o no publicado']);
            exit;
        }

        // Register visit
        $idVisita = $modelo->registrarVisitaFormulario(intval($form['idCuestionario']));

        echo json_encode(['success' => true, 'formulario' => $form, 'idVisita' => $idVisita]);
        exit;
    }

    // ================================================================
    //  POST — Submit responses or update visit
    // ================================================================
    if ($metodo === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $accion = $input['accion'] ?? 'responder';

        if ($accion === 'actualizar_visita') {
            $idVisita = intval($input['idVisita'] ?? 0);
            $duracion = intval($input['duracion'] ?? 0);
            $scrollMax = intval($input['scrollMax'] ?? 0);
            if ($idVisita > 0) {
                $modelo->actualizarVisitaFormulario($idVisita, $duracion, $scrollMax);
            }
            echo json_encode(['success' => true]);
            exit;
        }

        if ($accion === 'responder') {
            $idCuestionario = intval($input['idCuestionario'] ?? 0);
            $nombre = $input['nombre'] ?? null;
            $email = $input['email'] ?? null;
            $respuestas = $input['respuestas'] ?? [];
            $demograficos = [
                'sexo' => $input['sexo'] ?? null,
                'edad' => $input['edad'] ?? null,
                'idPais' => $input['idPais'] ?? null,
                'idEstado' => $input['idEstado'] ?? null,
                'idMunicipio' => $input['idMunicipio'] ?? null,
            ];
            if ($idCuestionario <= 0 || empty($respuestas)) {
                echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
                exit;
            }
            $result = $modelo->guardarRespuestas($idCuestionario, $nombre, $email, $respuestas, $demograficos);
            echo json_encode(['success' => true, 'resultado' => $result]);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'Accion no reconocida']);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
} catch (\Throwable $e) {
    error_log('[Formularios publico] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
