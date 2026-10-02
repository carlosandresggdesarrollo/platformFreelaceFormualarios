<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');
use administrador\Modules\ModulePugins\Conection\Conection as Conection;

class CambioPassHelper extends Conection {
    public function cambiarPass($idUsuario, $nuevaContrasena) {
        $this->open();
        $hash = password_hash($nuevaContrasena, PASSWORD_BCRYPT);
        $q = "UPDATE usuarios SET contrasena='" . mysqli_real_escape_string($this->Connection, $hash) . "', requiereCambioPass=0, fechaModificacion=NOW() WHERE idUsuario=" . intval($idUsuario);
        $ok = mysqli_query($this->Connection, $q);
        $this->closet();
        return $ok ? true : false;
    }
}

try {
    $body = json_decode(file_get_contents('php://input'), true);
    $idUsuario = intval($body['idUsuario'] ?? 0);
    $nuevaContrasena = trim($body['nuevaContrasena'] ?? '');

    if (!$idUsuario || !$nuevaContrasena) {
        echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        exit;
    }

    if (strlen($nuevaContrasena) < 6) {
        echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres']);
        exit;
    }

    $helper = new CambioPassHelper();
    $ok = $helper->cambiarPass($idUsuario, $nuevaContrasena);
    echo json_encode(['success' => $ok]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
