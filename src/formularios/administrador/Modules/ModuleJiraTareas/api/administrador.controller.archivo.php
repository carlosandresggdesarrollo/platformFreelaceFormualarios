<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include '../model/administrador.model.tareas.php';

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as model;

$JSON_RESULT = [];
$JSON_RESULT['message'] = '';

// Verificar que se subio un archivo
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    $JSON_RESULT['message'] = 'Bad';
    $JSON_RESULT['error'] = 'No se recibio el archivo';
    echo json_encode($JSON_RESULT);
    exit;
}

$idTarea = intval($_POST['idTarea']);
$archivo = $_FILES['archivo'];

// Crear directorio si no existe
$uploadDir = '../../../uploads/jira/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generar nombre unico
$extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombreArchivo = uniqid() . '_' . time() . '.' . $extension;
$rutaCompleta = $uploadDir . $nombreArchivo;

// Mover archivo
if (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
    $modelo = new model();
    $result = $modelo->agregarArchivo([
        'idTarea' => $idTarea,
        'nombreOriginal' => $archivo['name'],
        'nombreArchivo' => $nombreArchivo,
        'extension' => $extension,
        'tamano' => $archivo['size'],
        'mimeType' => $archivo['type'],
        'ruta' => 'uploads/jira/' . $nombreArchivo
    ]);
    echo json_encode($result);
} else {
    $JSON_RESULT['message'] = 'Bad';
    $JSON_RESULT['error'] = 'Error al guardar el archivo';
    echo json_encode($JSON_RESULT);
}
?>
