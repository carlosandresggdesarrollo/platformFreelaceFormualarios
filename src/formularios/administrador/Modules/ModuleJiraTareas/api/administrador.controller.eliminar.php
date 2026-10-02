<?php

include_once('../model/administrador.model.tareas.php');

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $idTarea = isset($_POST['idTarea']) ? intval($_POST['idTarea']) : 0;

    $Object = new tareas();
    $JSON_RESULT = $Object->eliminar($idTarea);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
