<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include '../model/administrador.model.tareas.php';

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as model;

$modelo = new model();
$result = $modelo->selectFases($_POST['idProyecto']);
echo json_encode($result);
?>
