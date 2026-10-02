<?php

/*<Include classes>*/
    include_once('../model/admin.model.dashboard.php');
/*</Include classes>*/

/*<Import>*/
    use administrador\Modules\ModuleAdminDashboard\Model\dashboard\dashboard as dashboard;
/*</Import>*/

/*<Header JSON>*/
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
/*</Header JSON>*/

session_start();

/*<Validar sesion - Solo administradores>*/
if(isset($_SESSION['administrador-session']) && $_SESSION['administrador-tipoUsuario'] != "CLIENTE") {

    /*<VARIABLES>*/
        $Objeto         = new dashboard();
        $JSON_RESULT    = [];

        // Obtener año del request (GET o POST)
        $anio = isset($_REQUEST['anio']) ? intval($_REQUEST['anio']) : intval(date('Y'));

        // Validar que el año sea razonable (entre 2020 y año actual + 1)
        $anioActual = intval(date('Y'));
        if ($anio < 2020 || $anio > $anioActual + 1) {
            $anio = $anioActual;
        }
    /*</VARIABLES>*/

    /*<CONSULTA>*/
        $JSON_RESULT = $Objeto->getAdminDashboardStats($anio);
    /*</CONSULTA>*/

    echo json_encode($JSON_RESULT);

} else {
    /*<Sin sesion>*/
        $JSON_RESULT['message'] = 'NO_SESSION';
        $JSON_RESULT['error'] = 'Usuario no autenticado o no tiene permisos de administrador';
        echo json_encode($JSON_RESULT);
    /*</Sin sesion>*/
}
