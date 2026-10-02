<?php

namespace administrador\Modules\ModuleClienteJiraProyectos\Model\proyectos;

include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection as Conection;

class proyectos extends Conection {

    public function __construct() {
        parent::__construct();
    }

    // Obtener proyectos del usuario actual
    public function selectFull() {
        $JSON_RESULT = [];
        $JSON_RESULT['proyectos'] = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $querySelect = 'SELECT * FROM jira_proyectos_view WHERE idUsuario = ' . intval($idUser) . ' ORDER BY fechaCreacion DESC;';

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['proyectos'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Obtener un proyecto por ID (solo si pertenece al usuario)
    public function selectOne($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['proyecto'] = null;
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $querySelect = 'SELECT * FROM jira_proyectos_view WHERE idProyecto = ' . intval($idProyecto) . ' AND idUsuario = ' . intval($idUser) . ';';

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            if ($resultQuery->num_rows > 0) {
                $JSON_RESULT['proyecto'] = $resultQuery->fetch_array(MYSQLI_ASSOC);
                $JSON_RESULT['message'] = "Good";
            } else {
                $JSON_RESULT['message'] = "NotFound";
            }
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Obtener tareas del proyecto
    public function getTareas($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['tareas'] = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        // Verificar que el proyecto pertenece al usuario
        $queryCheck = 'SELECT idProyecto FROM jira_proyectos WHERE idProyecto = ' . intval($idProyecto) . ' AND idUsuario = ' . intval($idUser) . ' AND bstate = 1;';

        $this->open();
        $resultCheck = mysqli_query($this->Connection, $queryCheck);
        if (!$resultCheck || $resultCheck->num_rows == 0) {
            $JSON_RESULT['message'] = "Unauthorized";
            $this->closet();
            return $JSON_RESULT;
        }

        $querySelect = 'SELECT * FROM jira_tareas_view WHERE idProyecto = ' . intval($idProyecto) . ' ORDER BY prioridad DESC, fechaVencimiento ASC;';

        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['tareas'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Dashboard del cliente
    public function getDashboard() {
        $JSON_RESULT = [];
        $JSON_RESULT['estadisticas'] = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $this->open();

        // Total proyectos
        $query = "SELECT COUNT(*) as total FROM jira_proyectos WHERE idUsuario = $idUser AND bstate = 1;";
        if ($result = mysqli_query($this->Connection, $query)) {
            $row = $result->fetch_array(MYSQLI_ASSOC);
            $JSON_RESULT['estadisticas']['totalProyectos'] = intval($row['total']);
        }

        // Total tareas por estatus
        $query = "SELECT t.estatus, COUNT(*) as total
                  FROM jira_tareas t
                  INNER JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
                  WHERE p.idUsuario = $idUser AND t.bstate = 1 AND p.bstate = 1
                  GROUP BY t.estatus;";
        if ($result = mysqli_query($this->Connection, $query)) {
            $JSON_RESULT['estadisticas']['porEstatus'] = [];
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $JSON_RESULT['estadisticas']['porEstatus'][$row['estatus']] = intval($row['total']);
            }
        }

        // Tareas vencidas
        $DATE = date('Y-m-d');
        $query = "SELECT COUNT(*) as total
                  FROM jira_tareas t
                  INNER JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
                  WHERE p.idUsuario = $idUser AND t.bstate = 1 AND p.bstate = 1
                  AND t.estatus NOT IN ('COMPLETADA', 'CANCELADA')
                  AND t.fechaVencimiento < '$DATE';";
        if ($result = mysqli_query($this->Connection, $query)) {
            $row = $result->fetch_array(MYSQLI_ASSOC);
            $JSON_RESULT['estadisticas']['vencidas'] = intval($row['total']);
        }

        // Proyectos recientes
        $query = "SELECT * FROM jira_proyectos_view WHERE idUsuario = $idUser ORDER BY fechaCreacion DESC LIMIT 5;";
        if ($result = mysqli_query($this->Connection, $query)) {
            $JSON_RESULT['proyectosRecientes'] = [];
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['proyectosRecientes'], $row);
            }
        }

        // Tareas próximas a vencer
        $query = "SELECT t.*, p.nombre as nombreProyecto, p.color as colorProyecto
                  FROM jira_tareas t
                  INNER JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
                  WHERE p.idUsuario = $idUser AND t.bstate = 1 AND p.bstate = 1
                  AND t.estatus NOT IN ('COMPLETADA', 'CANCELADA')
                  AND t.fechaVencimiento >= '$DATE'
                  ORDER BY t.fechaVencimiento ASC LIMIT 5;";
        if ($result = mysqli_query($this->Connection, $query)) {
            $JSON_RESULT['tareasProximas'] = [];
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['tareasProximas'], $row);
            }
        }

        $JSON_RESULT['message'] = "Good";
        $this->closet();

        return $JSON_RESULT;
    }

    // Calendario del cliente
    public function getCalendario() {
        $JSON_RESULT = [];
        $JSON_RESULT['eventos'] = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $querySelect = "SELECT t.*, p.nombre as nombreProyecto, p.color as colorProyecto
                        FROM jira_tareas t
                        INNER JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
                        WHERE p.idUsuario = $idUser AND t.bstate = 1 AND p.bstate = 1
                        ORDER BY t.fechaVencimiento ASC;";

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                $evento = [
                    'id' => $row['idTarea'],
                    'title' => $row['titulo'],
                    'start' => $row['fechaVencimiento'],
                    'end' => $row['fechaVencimiento'],
                    'color' => $row['colorProyecto'] ?? '#1976D2',
                    'extendedProps' => [
                        'idProyecto' => $row['idProyecto'],
                        'nombreProyecto' => $row['nombreProyecto'],
                        'prioridad' => $row['prioridad'],
                        'estatus' => $row['estatus'],
                        'tipo' => $row['tipo']
                    ]
                ];
                array_push($JSON_RESULT['eventos'], $evento);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }
}

?>
