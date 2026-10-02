<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['administrador-idUsuario'])) {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}
$idUsuario = intval($_SESSION['administrador-idUsuario']);

require_once('../model/administrador.model.cuestionarios.php');
require_once(__DIR__ . '/../../ModuleDeepSeek/model/administrador.model.deepseek.php');

use administrador\Modules\ModuleCuestionarios\Model\CuestionariosModel;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    exit;
}

try {
    $body = json_decode(file_get_contents('php://input'), true);

    $tema           = trim($body['tema'] ?? '');
    $numPreguntas   = intval($body['numPreguntas'] ?? 10);
    $numOpciones    = intval($body['numOpciones'] ?? 4);
    $instrucciones  = trim($body['instrucciones'] ?? '');
    $modeloSeleccionado = $body['modelo'] ?? '';

    if ($tema === '') {
        echo json_encode(['success' => false, 'error' => 'El tema es obligatorio']);
        exit;
    }

    if ($numPreguntas < 1) $numPreguntas = 10;
    if ($numOpciones < 2)  $numOpciones = 4;

    // Build prompts for DeepSeek
    $systemPrompt = 'Eres un generador de cuestionarios educativos. Responde UNICAMENTE con JSON valido, sin texto adicional.';

    $userPrompt  = 'Genera un cuestionario sobre "' . $tema . '" con ' . $numPreguntas . ' preguntas. ';
    $userPrompt .= 'Cada pregunta debe tener exactamente ' . $numOpciones . ' opciones de respuesta. ';
    $userPrompt .= 'Marca exactamente una opcion como correcta por pregunta.';

    if ($instrucciones !== '') {
        $userPrompt .= ' ' . $instrucciones;
    }

    $userPrompt .= "\n\nResponde con este formato JSON:\n";
    $userPrompt .= '{"titulo": "...", "descripcion": "...", "preguntas": [{"texto": "...", "opciones": [{"texto": "...", "esCorrecta": true/false}]}]}';

    $mensajes = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user',   'content' => $userPrompt]
    ];

    // Call DeepSeek
    $deepseek = new model();
    $deepseek->setLogContexto('Cuestionarios', 'generar', $tema);

    $resultado = $deepseek->chat($modeloSeleccionado, $mensajes, true);

    if (empty($resultado['success'])) {
        echo json_encode(['success' => false, 'error' => $resultado['error'] ?? 'Error al generar con IA']);
        exit;
    }

    // Parse AI response
    $contenido = $resultado['content'] ?? '';
    $data = json_decode($contenido, true);

    if (!$data || !isset($data['preguntas']) || !is_array($data['preguntas'])) {
        echo json_encode(['success' => false, 'error' => 'La IA no devolvio un formato valido', 'raw' => $contenido]);
        exit;
    }

    // Import into database
    $cuestionariosModel = new CuestionariosModel();
    $importResult = $cuestionariosModel->importarCuestionarioCompleto(
        $data['titulo'] ?? $tema,
        $data['descripcion'] ?? '',
        $data['preguntas'],
        $idUsuario
    );

    $importResult['usage'] = $resultado['usage'] ?? null;

    echo json_encode($importResult);

} catch (\Throwable $e) {
    error_log('[Cuestionarios IA] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
?>
