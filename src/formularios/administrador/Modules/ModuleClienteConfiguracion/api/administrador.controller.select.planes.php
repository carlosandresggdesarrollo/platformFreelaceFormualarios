<?php

/*<Include classes>*/
include_once('../model/administrador.model.configuracion.php');
/*</Include classes>*/

/*<Import>*/
use administrador\Modules\ModuleClienteConfiguracion\Model\configuracion\configuracion as configuracion;
/*</Import>*/


/*<Controlador>*/
    try{
        /*<Instaciacion de objetos>*/
            $ObjectConfiguracion = new configuracion();
        /*</Instaciacion de objetos>*/

        /*<Obtener idUsuario>*/
            session_start();
            $idUsuario = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

            // Si viene por POST, usar ese valor
            if(isset($_POST['idUsuario']) && !empty($_POST['idUsuario'])){
                $idUsuario = intval($_POST['idUsuario']);
            }
        /*</Obtener idUsuario>*/

        /*<Proceso>*/
            if($idUsuario > 0){
                $JSON_RESULT = $ObjectConfiguracion->JSON_CONSULTA_PLANES_SMS($idUsuario);
            } else {
                $JSON_RESULT = [];
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'No se encontró idUsuario';
                $JSON_RESULT['planes_pagados'] = [];
                $JSON_RESULT['planes_pendientes'] = [];
                $JSON_RESULT['resumen'] = [];
            }
        /*</Proceso>*/

        /*<Respuesta>*/
            echo json_encode($JSON_RESULT);
        /*</Respuesta>*/

    } catch(Exception $e){
        $JSON_RESULT            = [];
        $JSON_RESULT['message'] = 'Sorry error server';
        $JSON_RESULT['error']   = $e->getMessage();
        echo json_encode($JSON_RESULT);
    }

/*</Controlador>*/

?>
