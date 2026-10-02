<?php

include_once('../model/administrador.model.tareas.php');

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $idUsuario = isset($_POST['idUsuario']) ? intval($_POST['idUsuario']) : null;

    $Object = new tareas();
    $JSON_RESULT = $Object->getDashboard($idUsuario);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
