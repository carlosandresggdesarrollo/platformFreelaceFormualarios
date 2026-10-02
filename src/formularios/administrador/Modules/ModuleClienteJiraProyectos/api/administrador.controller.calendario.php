<?php

include_once('../model/administrador.model.proyectos.php');
include_once('../../ModuleJiraTareas/model/administrador.model.tareas.php');

use administrador\Modules\ModuleClienteJiraProyectos\Model\proyectos\proyectos as proyectos;
use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $mes = isset($_POST['mes']) ? intval($_POST['mes']) : date('m');
    $anio = isset($_POST['anio']) ? intval($_POST['anio']) : date('Y');

    $Object = new proyectos();
    $JSON_RESULT = $Object->getCalendario($mes, $anio);

    // Obtener notas del calendario
    $tareasObj = new tareas();
    $notasResult = $tareasObj->selectNotasCalendario($mes, $anio);
    $JSON_RESULT['notas'] = $notasResult['notas'] ?? [];

    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
