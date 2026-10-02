<?php

include_once('../model/administrador.model.proyectos.php');

use administrador\Modules\ModuleJiraProyectos\Model\proyectos\proyectos as proyectos;

try {
    $Object = new proyectos();
    $JSON_RESULT = $Object->getUsuarios();
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    $JSON_RESULT['error'] = $e->getMessage();
    echo json_encode($JSON_RESULT);
}

?>
