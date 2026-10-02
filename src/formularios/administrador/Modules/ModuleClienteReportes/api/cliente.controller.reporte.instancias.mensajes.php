<?php

/*<Include classes>*/
    include_once('../model/cliente.model.reportes.php');
/*</Include classes>*/

/*<Import>*/
    use administrador\Modules\ModuleClienteReportes\Model\reportes\reportes as reportes;
/*</Import>*/

/*<Header JSON>*/
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
/*</Header JSON>*/

session_start();

/*<Validar sesion>*/
if(isset($_SESSION['administrador-session']) && $_SESSION['administrador-tipoUsuario'] == "CLIENTE" && $_SESSION["administrador-estatus"] == 'ACTIVO') {

    /*<VARIABLES>*/
        $Objeto         = new reportes();
        $JSON_RESULT    = [];
        $idCliente      = $_SESSION['administrador-idUsuario'];

        $fechaInicio    = isset($_POST['fechaInicio']) ? $_POST['fechaInicio'] : date('Y-m-01');
        $fechaFin       = isset($_POST['fechaFin']) ? $_POST['fechaFin'] : date('Y-m-d');
    /*</VARIABLES>*/

    /*<CONSULTA>*/
        $JSON_RESULT = $Objeto->reporteMensajesInstancias($fechaInicio, $fechaFin, $idCliente);
    /*</CONSULTA>*/

    echo json_encode($JSON_RESULT);

} else {
    /*<Sin sesion>*/
        $JSON_RESULT['message'] = 'NO_SESSION';
        $JSON_RESULT['error'] = 'Usuario no autenticado o sesion expirada';
        echo json_encode($JSON_RESULT);
    /*</Sin sesion>*/
}
