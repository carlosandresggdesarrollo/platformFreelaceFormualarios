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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Solo POST']);
    exit;
}

try {
    $modelo = new FormulariosModel();

    $idCuestionario = intval($_POST['idCuestionario'] ?? 0);
    $tipo = $_POST['tipo'] ?? '';

    if ($idCuestionario <= 0) {
        echo json_encode(['success' => false, 'error' => 'ID de formulario requerido']);
        exit;
    }

    if (!$modelo->verificarPropietario($idCuestionario, $idUsuario)) {
        echo json_encode(['success' => false, 'error' => 'Sin permiso']);
        exit;
    }

    if (!in_array($tipo, ['imagen', 'audio'], true)) {
        echo json_encode(['success' => false, 'error' => 'Tipo debe ser "imagen" o "audio"']);
        exit;
    }

    if (!isset($_FILES['archivo'])) {
        echo json_encode(['success' => false, 'error' => 'No se recibio archivo']);
        exit;
    }

    $result = $modelo->uploadFormFile($_FILES['archivo'], $tipo);

    if ($result['success']) {
        $campo = $tipo === 'imagen' ? 'imagenFondo' : 'musicaUrl';
        $campos = [$campo => $result['path']];
        if ($tipo === 'audio') {
            $campos['musicaTipo'] = 'archivo';
        }
        $modelo->actualizarPersonalizacion($idCuestionario, $campos, $idUsuario);
    }

    echo json_encode($result);
} catch (\Throwable $e) {
    error_log('[FormulariosUpload] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
