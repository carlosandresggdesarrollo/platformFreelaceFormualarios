<?php

include_once('../model/administrador.model.proyectos.php');

use administrador\Modules\ModuleJiraProyectos\Model\proyectos\proyectos as proyectos;

try {
    $idProyecto = isset($_POST['idProyecto']) ? intval($_POST['idProyecto']) : 0;

    $datos = [];
    if (isset($_POST['nombre'])) $datos['nombre'] = $_POST['nombre'];
    if (isset($_POST['descripcion'])) $datos['descripcion'] = $_POST['descripcion'];
    if (isset($_POST['color'])) $datos['color'] = $_POST['color'];
    if (isset($_POST['icono'])) $datos['icono'] = $_POST['icono'];
    if (isset($_POST['estatus'])) $datos['estatus'] = $_POST['estatus'];
    if (isset($_POST['fechaInicio'])) $datos['fechaInicio'] = $_POST['fechaInicio'];
    if (isset($_POST['fechaFin'])) $datos['fechaFin'] = $_POST['fechaFin'];

    $Object = new proyectos();
    $JSON_RESULT = $Object->actualizar($idProyecto, $datos);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    $JSON_RESULT['error'] = $e->getMessage();
    echo json_encode($JSON_RESULT);
}

?>
