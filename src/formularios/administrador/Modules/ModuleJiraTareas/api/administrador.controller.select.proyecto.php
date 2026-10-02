<?php

include_once('../model/administrador.model.tareas.php');

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $idProyecto = isset($_POST['idProyecto']) ? intval($_POST['idProyecto']) : 0;

    $Object = new tareas();
    $JSON_RESULT = $Object->selectByProyecto($idProyecto);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
