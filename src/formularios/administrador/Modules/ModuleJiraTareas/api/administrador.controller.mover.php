<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include '../model/administrador.model.tareas.php';

use administrador\Modules\ModuleJiraTareas\Model\tareas\tareas as model;

$modelo = new model();
$idTarea = $_POST['idTarea'];
$idFase = $_POST['idFase'];
$orden = isset($_POST['orden']) ? $_POST['orden'] : null;

$result = $modelo->moverTarea($idTarea, $idFase, $orden);
echo json_encode($result);
?>
