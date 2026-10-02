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
    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$descripcion = trim($input['descripcion'] ?? '');

if (empty($descripcion)) {
    echo json_encode(['success' => false, 'error' => 'Debes describir el formulario que quieres crear']);
    exit;
}

$config = include(__DIR__ . '/../config/deepseek.config.php');
$apiKey = $config['api_key'] ?? '';
$model  = $config['model'] ?? 'deepseek-chat';
$apiUrl = $config['api_url'] ?? 'https://api.deepseek.com/chat/completions';

if (empty($apiKey) || $apiKey === 'TU_API_KEY_DEEPSEEK_AQUI') {
    echo json_encode(['success' => false, 'error' => 'La API key de DeepSeek no esta configurada. Edita el archivo config/deepseek.config.php']);
    exit;
}

$systemPrompt = <<<'PROMPT'
Eres un asistente que crea formularios/encuestas. El usuario te describira un formulario y debes generar un JSON con la estructura completa.

REGLAS:
- Responde UNICAMENTE con un JSON valido, sin texto antes ni despues, sin bloques de codigo markdown.
- Los temas disponibles son: "corporativo", "oscuro", "naturaleza", "startup", "tech". Si el usuario no especifica tema, usa "corporativo".
- musicaTipo puede ser: "youtube" o "archivo". Si pasan un link de YouTube, usa "youtube".
- Cada pregunta DEBE tener al menos 2 opciones.
- Marca con esCorrecta:true la opcion que mejor responda (si el usuario la indica), o la primera opcion si no se especifica.
- Los textos deben estar en espanol.
- No uses acentos en el JSON (usa "opcion" no "opción").

ESTRUCTURA JSON:
{
  "titulo": "string",
  "descripcion": "string",
  "tema": "corporativo|oscuro|naturaleza|startup|tech",
  "colorPrimario": "#hex o null",
  "colorFondo": "#hex o null",
  "imagenFondo": "url o null",
  "musicaUrl": "url o null",
  "musicaTipo": "youtube|archivo o null",
  "opacidadFondo": 40,
  "preguntas": [
    {
      "textoPregunta": "string",
      "opciones": [
        { "texto": "string", "esCorrecta": true },
        { "texto": "string", "esCorrecta": false }
      ]
    }
  ]
}
PROMPT;

$payload = [
    'model'    => $model,
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user',   'content' => $descripcion],
    ],
    'temperature'  => 0.7,
    'max_tokens'   => 4000,
    'response_format' => ['type' => 'json_object'],
];

$jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);

$context = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\nAuthorization: Bearer $apiKey\r\n",
        'content' => $jsonPayload,
        'timeout' => 60,
        'ignore_errors' => true,
    ],
    'ssl' => [
        'verify_peer' => true,
        'verify_peer_name' => true,
    ],
]);

$response = @file_get_contents($apiUrl, false, $context);

if ($response === false) {
    echo json_encode(['success' => false, 'error' => 'No se pudo conectar con DeepSeek. Verifica tu conexion a internet y la API key.']);
    exit;
}

$data = json_decode($response, true);

if (isset($data['error'])) {
    $errMsg = $data['error']['message'] ?? 'Error desconocido de DeepSeek';
    echo json_encode(['success' => false, 'error' => "DeepSeek: $errMsg"]);
    exit;
}

$content = $data['choices'][0]['message']['content'] ?? '';

if (empty($content)) {
    echo json_encode(['success' => false, 'error' => 'DeepSeek no genero una respuesta valida']);
    exit;
}

$formData = json_decode($content, true);

if (!$formData || !isset($formData['titulo']) || !isset($formData['preguntas'])) {
    echo json_encode(['success' => false, 'error' => 'La IA no genero un formulario valido. Intenta con una descripcion mas detallada.']);
    exit;
}

try {
    $modelo = new FormulariosModel();
    $result = $modelo->crearFormularioCompleto($formData, $idUsuario);
    echo json_encode($result);
} catch (\Throwable $e) {
    error_log('[Formularios IA] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error al crear el formulario: ' . $e->getMessage()]);
}
