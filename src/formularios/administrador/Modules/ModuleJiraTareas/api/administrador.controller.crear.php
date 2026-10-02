<?php

include_once('../model/administrador.model.tareas.php');

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $datos = [
        'idProyecto' => isset($_POST['idProyecto']) ? intval($_POST['idProyecto']) : 0,
        'titulo' => isset($_POST['titulo']) ? $_POST['titulo'] : '',
        'descripcion' => isset($_POST['descripcion']) ? $_POST['descripcion'] : '',
        'prioridad' => isset($_POST['prioridad']) ? $_POST['prioridad'] : 'MEDIA',
        'tipo' => isset($_POST['tipo']) ? $_POST['tipo'] : 'TAREA',
        'fechaVencimiento' => isset($_POST['fechaVencimiento']) ? $_POST['fechaVencimiento'] : null,
        'horasEstimadas' => isset($_POST['horasEstimadas']) ? floatval($_POST['horasEstimadas']) : 0,
        'idUsuarioAsignado' => isset($_POST['idUsuarioAsignado']) ? intval($_POST['idUsuarioAsignado']) : null
    ];

    $Object = new tareas();
    $JSON_RESULT = $Object->crear($datos);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
