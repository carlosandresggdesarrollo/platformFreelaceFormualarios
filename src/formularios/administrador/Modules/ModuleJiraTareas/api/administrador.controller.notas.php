<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once('../model/administrador.model.tareas.php');

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $Object = new tareas();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // Obtener notas por mes/año o una nota específica
            if (isset($_GET['idNota'])) {
                $JSON_RESULT = $Object->getNotaPorId(intval($_GET['idNota']));
            } else {
                $mes = isset($_GET['mes']) ? intval($_GET['mes']) : date('m');
                $anio = isset($_GET['anio']) ? intval($_GET['anio']) : date('Y');
                $JSON_RESULT = $Object->selectNotasCalendario($mes, $anio);
            }
            break;

        case 'POST':
            // Crear nueva nota
            $datos = [
                'fecha' => $_POST['fecha'] ?? date('Y-m-d'),
                'titulo' => $_POST['titulo'] ?? '',
                'contenido' => $_POST['contenido'] ?? '',
                'color' => $_POST['color'] ?? '#FFC107',
                'icono' => $_POST['icono'] ?? 'mdi:note-outline',
                'recordatorio' => isset($_POST['recordatorio']) ? (bool)$_POST['recordatorio'] : false,
                'horaRecordatorio' => $_POST['horaRecordatorio'] ?? null
            ];

            if (empty($datos['titulo'])) {
                $JSON_RESULT = ['message' => 'Bad', 'error' => 'El título es requerido'];
            } else {
                $JSON_RESULT = $Object->crearNota($datos);
            }
            break;

        case 'PUT':
            // Actualizar nota
            parse_str(file_get_contents("php://input"), $put_vars);

            $idNota = intval($put_vars['idNota'] ?? 0);
            if (!$idNota) {
                $JSON_RESULT = ['message' => 'Bad', 'error' => 'ID de nota requerido'];
            } else {
                $datos = [];
                if (isset($put_vars['titulo'])) $datos['titulo'] = $put_vars['titulo'];
                if (isset($put_vars['contenido'])) $datos['contenido'] = $put_vars['contenido'];
                if (isset($put_vars['color'])) $datos['color'] = $put_vars['color'];
                if (isset($put_vars['icono'])) $datos['icono'] = $put_vars['icono'];
                if (isset($put_vars['fecha'])) $datos['fecha'] = $put_vars['fecha'];
                if (isset($put_vars['recordatorio'])) $datos['recordatorio'] = (bool)$put_vars['recordatorio'];
                if (isset($put_vars['horaRecordatorio'])) $datos['horaRecordatorio'] = $put_vars['horaRecordatorio'];

                $JSON_RESULT = $Object->actualizarNota($idNota, $datos);
            }
            break;

        case 'DELETE':
            // Eliminar nota
            parse_str(file_get_contents("php://input"), $delete_vars);
            $idNota = intval($delete_vars['idNota'] ?? 0);

            if (!$idNota) {
                $JSON_RESULT = ['message' => 'Bad', 'error' => 'ID de nota requerido'];
            } else {
                $JSON_RESULT = $Object->eliminarNota($idNota);
            }
            break;

        default:
            $JSON_RESULT = ['message' => 'Bad', 'error' => 'Método no soportado'];
    }

    echo json_encode($JSON_RESULT);

} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    $JSON_RESULT['error'] = $e->getMessage();
    echo json_encode($JSON_RESULT);
}

?>
