<?php

/*<Include classes>*/
    include_once('../model/cliente.model.reportes.php');
/*</Include classes>*/

/*<Import>*/
    use administrador\Modules\ModuleClienteReportes\Model\reportes\reportes as reportes;
/*</Import>*/

session_start();

/*<Validar sesion>*/
if(isset($_SESSION['administrador-session']) && $_SESSION['administrador-tipoUsuario'] == "CLIENTE" && $_SESSION["administrador-estatus"] == 'ACTIVO') {

    /*<VARIABLES>*/
        $Objeto         = new reportes();
        $JSON_RESULT    = [];
        $idCliente      = $_SESSION['administrador-idUsuario'];

        $fechaInicio    = isset($_GET['fechaInicio']) ? $_GET['fechaInicio'] : date('Y-m-01');
        $fechaFin       = isset($_GET['fechaFin']) ? $_GET['fechaFin'] : date('Y-m-d');
        $archivo        = isset($_GET['archivo']) ? $_GET['archivo'] : 'PDF';
    /*</VARIABLES>*/

    /*<EXPORTAR>*/
        if($archivo == 'EXCEL') {
            /*<EXCEL>*/
                $JSON_RESULT = $Objeto->exportarExcelInstancias($fechaInicio, $fechaFin, $idCliente);

                if($JSON_RESULT['message'] == 'Good') {
                    header('Location: ' . $JSON_RESULT['URL']);
                    exit;
                } else {
                    header('Content-Type: application/json');
                    echo json_encode($JSON_RESULT);
                }
            /*</EXCEL>*/
        } else {
            /*<PDF>*/
                $Objeto->exportarPDFInstancias($fechaInicio, $fechaFin, $idCliente);
            /*</PDF>*/
        }
    /*</EXPORTAR>*/

} else {
    /*<Sin sesion>*/
        header('Content-Type: application/json');
        $JSON_RESULT['message'] = 'NO_SESSION';
        $JSON_RESULT['error'] = 'Usuario no autenticado o sesion expirada';
        echo json_encode($JSON_RESULT);
    /*</Sin sesion>*/
}
