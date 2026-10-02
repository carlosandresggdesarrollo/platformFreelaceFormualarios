<?php

include_once('../model/administrador.model.proyectos.php');

use administrador\Modules\ModuleClienteJiraProyectos\Model\proyectos\proyectos as proyectos;

try {
    $idProyecto = isset($_POST['idProyecto']) ? intval($_POST['idProyecto']) : 0;

    $Object = new proyectos();
    $JSON_RESULT = $Object->selectOne($idProyecto);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
