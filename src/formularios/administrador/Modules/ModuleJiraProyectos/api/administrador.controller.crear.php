<?php

include_once('../model/administrador.model.proyectos.php');

use administrador\Modules\ModuleJiraProyectos\Model\proyectos\proyectos as proyectos;

try {
    $datos = [
        'nombre' => isset($_POST['nombre']) ? $_POST['nombre'] : '',
        'descripcion' => isset($_POST['descripcion']) ? $_POST['descripcion'] : '',
        'color' => isset($_POST['color']) ? $_POST['color'] : '#1976D2',
        'icono' => isset($_POST['icono']) ? $_POST['icono'] : 'solar:folder-bold',
        'idUsuario' => isset($_POST['idUsuario']) ? intval($_POST['idUsuario']) : 0,
        'fechaInicio' => isset($_POST['fechaInicio']) ? $_POST['fechaInicio'] : null,
        'fechaFin' => isset($_POST['fechaFin']) ? $_POST['fechaFin'] : null
    ];

    $Object = new proyectos();
    $JSON_RESULT = $Object->crear($datos);
    echo json_encode($JSON_RESULT);
} catch(Exception $e) {
    $JSON_RESULT = [];
    $JSON_RESULT['message'] = 'Error server';
    $JSON_RESULT['error'] = $e->getMessage();
    echo json_encode($JSON_RESULT);
}

?>
