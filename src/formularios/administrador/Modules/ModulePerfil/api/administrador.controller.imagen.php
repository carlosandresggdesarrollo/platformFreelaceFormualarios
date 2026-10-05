<?php
header('Content-Type: application/json');

require_once(__DIR__ . '/../../ModulePugins/administrador.Subidas.php');

use administrador\Modules\ModulePugins\Subidas\Subidas;

echo json_encode(Subidas::guardarImagen(reset($_FILES) ?: null, 'perfiles', 'perfil'));
