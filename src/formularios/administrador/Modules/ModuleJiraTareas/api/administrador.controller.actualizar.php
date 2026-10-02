<?php

include_once('../model/administrador.model.tareas.php');

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as tareas;

try {
    $idTarea = isset($_POST['idTarea']) ? intval($_POST['idTarea']) : 0;

    $datos = [];
    if (isset($_POST['titulo'])) $datos['titulo'] = $_POST['titulo'];
    if (isset($_POST['descripcion'])) $datos['descripcion'] = $_POST['descripcion'];
    if (isset($_POST['prioridad'])) $datos['prioridad'] = $_POST['prioridad'];
    if (isset($_POST['estatus'])) $datos['estatus'] = $_POST['estatus'];
    if (isset($_POST['tipo'])) $datos['tipo'] = $_POST['tipo'];
    if (isset($_POST['fechaVencimiento'])) $datos['fechaVencimiento'] = $_POST['fechaVencimiento'];
    if (isset($_POST['horasEstimadas'])) $datos['horasEstimadas'] = floatval($_POST['horasEstimadas']);
    if (isset($_POST['horasReales'])) $datos['horasReales'] = floatval($_POST['horasReales']);
    if (isset($_POST['porcentajeAvance'])) $datos['porcentajeAvance'] = intval($_POST['porcentajeAvance']);
    if (isset($_POST['idUsuarioAsignado'])) $datos['idUsuarioAsignado'] = $_POST['idUsuarioAsignado'] ? intval($_POST['idUsuarioAsignado']) : null;

    $Object = new tareas();
    $JSON_RESULT = $Object->actualizar($idTarea, $datos);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    echo json_encode($JSON_RESULT);
}

?>
