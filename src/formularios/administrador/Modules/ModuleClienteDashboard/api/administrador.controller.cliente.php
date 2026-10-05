<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../model/administrador.model.cliente.dashboard.php');
use administrador\Modules\ModuleClienteDashboard\Model\ClienteDashboardModel;

$idUsuario = isset($_SESSION['administrador-idUsuario']) ? intval($_SESSION['administrador-idUsuario']) : 0;
if (!$idUsuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $modelo = new ClienteDashboardModel();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $vista = $_GET['vista'] ?? 'cuestionarios';

        if ($vista === 'cuestionarios') {
            $data = $modelo->getMisCuestionariosResueltos($idUsuario);
            echo json_encode(['success' => true, 'cuestionarios' => $data]);
            exit;
        }

        if ($vista === 'detalle') {
            $idSesion = intval($_GET['idSesion'] ?? 0);
            if ($idSesion <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID requerido']);
                exit;
            }
            $data = $modelo->getDetalleRespuestas($idSesion, $idUsuario);
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'No encontrado']);
                exit;
            }
            echo json_encode(['success' => true, 'detalle' => $data]);
            exit;
        }

        if ($vista === 'ranking') {
            $ranking = $modelo->getRanking(50);
            $miMejor = $modelo->getMiMejorPuntaje($idUsuario);
            $miPos = $modelo->getMiPosicionRanking($idUsuario);
            $misPuntajes = $modelo->getMisPuntajes($idUsuario);
            echo json_encode([
                'success' => true,
                'ranking' => $ranking,
                'miMejorPuntaje' => $miMejor,
                'miPosicion' => $miPos,
                'misPuntajes' => $misPuntajes,
            ]);
            exit;
        }
    }

    if ($metodo === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $accion = $input['accion'] ?? ($_POST['accion'] ?? '');

        if ($accion === 'guardar_puntaje') {
            $puntaje = intval($input['puntaje'] ?? 0);
            $movimientos = intval($input['movimientos'] ?? 0);
            $tiempo = intval($input['tiempo'] ?? 0);
            $nivel = $input['nivel'] ?? 'normal';

            $id = $modelo->guardarPuntaje($idUsuario, $puntaje, $movimientos, $tiempo, $nivel);
            echo json_encode(['success' => true, 'idPuntaje' => $id]);
            exit;
        }
    }

    echo json_encode(['success' => false, 'error' => 'Accion no valida']);

} catch (Exception $e) {
    http_response_code(500);
    error_log('[Backend] ' . $e->getMessage()); echo json_encode(['success' => false, 'error' => 'Error del servidor']);
}
