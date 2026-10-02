<?php

include_once('../model/administrador.model.proyectos.php');

use administrador\Modules\ModuleClienteJiraProyectos\Model\proyectos\proyectos as proyectos;

try {
    $Object = new proyectos();
    $JSON_RESULT = $Object->getDashboard();
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
