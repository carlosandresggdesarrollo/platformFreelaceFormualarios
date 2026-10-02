<?php
/**
 * API pública para obtener los planes disponibles
 * Este endpoint NO requiere autenticación
 * Se usa para mostrar los planes en la página de inicio
 */

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir configuración de conexión
include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection as Conection;

class PublicPlanes extends Conection {

    public function __construct() {
        parent::__construct();
    }

    public function obtenerPlanesActivos() {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['planes'] = [];

        $querySelect = "SELECT
                            idPlan,
                            nombre,
                            descripcion,
                            vigencia,
                            unidad,
                            costo,
                            vinculaciones,
                            agentes,
                            bot,
                            menu
                        FROM cat_planes
                        WHERE bstate = 1
                        ORDER BY costo ASC";

        $this->open();

        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            if ($resultQuery->num_rows > 0) {
                while ($plan = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                    array_push($JSON_RESULT['planes'], $plan);
                }
            }
            $JSON_RESULT['message'] = 'Good';
        } else {
            $JSON_RESULT['message'] = 'Bad';
            $JSON_RESULT['error'] = mysqli_error($this->Connection);
        }

        $this->closet();

        return $JSON_RESULT;
    }
}

// Ejecutar
try {
    $api = new PublicPlanes();
    $result = $api->obtenerPlanesActivos();
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'message' => 'Error',
        'error' => $e->getMessage()
    ]);
}
?>
