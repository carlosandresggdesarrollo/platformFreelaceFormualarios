<?php

namespace administrador\Modules\ModuleJiraTareas\Model\tareas;

include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection as Conection;

class tareas extends Conection {

    public function __construct() {
        parent::__construct();
    }

    // ==========================================
    // FASES
    // ==========================================

    public function selectFases($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['fases'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = 'SELECT * FROM jira_fases WHERE idProyecto = ' . intval($idProyecto) . ' AND bstate = 1 ORDER BY orden ASC;';

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['fases'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function crearFase($datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $idProyecto = intval($datos['idProyecto']);
        $nombre = mysqli_real_escape_string($this->Connection, $datos['nombre']);
        $color = mysqli_real_escape_string($this->Connection, $datos['color'] ?? '#1976D2');

        // Obtener orden maximo
        $this->open();
        $queryOrden = "SELECT COALESCE(MAX(orden), 0) + 1 as nuevoOrden FROM jira_fases WHERE idProyecto = $idProyecto AND bstate = 1;";
        $resultOrden = mysqli_query($this->Connection, $queryOrden);
        $orden = 1;
        if ($resultOrden && $row = $resultOrden->fetch_array(MYSQLI_ASSOC)) {
            $orden = $row['nuevoOrden'];
        }

        $queryInsert = "INSERT INTO jira_fases (idProyecto, nombre, color, orden, esInicial, esFinal)
                        VALUES ($idProyecto, '$nombre', '$color', $orden, 0, 0);";

        if (mysqli_query($this->Connection, $queryInsert)) {
            $JSON_RESULT['idFase'] = mysqli_insert_id($this->Connection);
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function actualizarFase($datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $idFase = intval($datos['idFase']);
        $nombre = mysqli_real_escape_string($this->Connection, $datos['nombre']);
        $color = mysqli_real_escape_string($this->Connection, $datos['color'] ?? '#1976D2');

        $queryUpdate = "UPDATE jira_fases SET nombre = '$nombre', color = '$color' WHERE idFase = $idFase;";

        $this->open();
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function eliminarFase($idFase) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        $queryUpdate = "UPDATE jira_fases SET bstate = 0 WHERE idFase = " . intval($idFase) . ";";
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function reordenarFases($fases) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        foreach ($fases as $fase) {
            $idFase = intval($fase['idFase']);
            $orden = intval($fase['orden']);
            $query = "UPDATE jira_fases SET orden = $orden WHERE idFase = $idFase;";
            mysqli_query($this->Connection, $query);
        }
        $JSON_RESULT['message'] = "Good";
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // TAREAS
    // ==========================================

    public function selectFull() {
        $JSON_RESULT = [];
        $JSON_RESULT['tareas'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = 'SELECT * FROM jira_tareas_view ORDER BY ordenFase, orden;';

        $this->open();
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

    public function selectByProyecto($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['tareas'] = [];
        $JSON_RESULT['fases'] = [];
        $JSON_RESULT['message'] = '';

        $this->open();

        // Obtener fases
        $queryFases = 'SELECT * FROM jira_fases WHERE idProyecto = ' . intval($idProyecto) . ' AND bstate = 1 ORDER BY orden ASC;';
        if ($resultQuery = mysqli_query($this->Connection, $queryFases)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                $row['tareas'] = [];
                array_push($JSON_RESULT['fases'], $row);
            }
        }

        // Obtener tareas
        $queryTareas = 'SELECT * FROM jira_tareas_view WHERE idProyecto = ' . intval($idProyecto) . ' ORDER BY orden ASC;';
        if ($resultQuery = mysqli_query($this->Connection, $queryTareas)) {
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

    public function selectOne($idTarea) {
        $JSON_RESULT = [];
        $JSON_RESULT['tarea'] = null;
        $JSON_RESULT['comentarios'] = [];
        $JSON_RESULT['archivos'] = [];
        $JSON_RESULT['message'] = '';

        $this->open();

        // Obtener tarea
        $querySelect = 'SELECT * FROM jira_tareas_view WHERE idTarea = ' . intval($idTarea) . ';';
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            if ($resultQuery->num_rows > 0) {
                $JSON_RESULT['tarea'] = $resultQuery->fetch_array(MYSQLI_ASSOC);
                $JSON_RESULT['message'] = "Good";
            } else {
                $JSON_RESULT['message'] = "NotFound";
            }
        }

        // Obtener comentarios
        $queryComentarios = 'SELECT * FROM jira_comentarios_view WHERE idTarea = ' . intval($idTarea) . ' ORDER BY fechaCreacion DESC;';
        if ($resultQuery = mysqli_query($this->Connection, $queryComentarios)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['comentarios'], $row);
            }
        }

        // Obtener archivos
        $queryArchivos = 'SELECT * FROM jira_archivos_view WHERE idTarea = ' . intval($idTarea) . ' ORDER BY fechaCreacion DESC;';
        if ($resultQuery = mysqli_query($this->Connection, $queryArchivos)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['archivos'], $row);
            }
        }

        $this->closet();

        return $JSON_RESULT;
    }

    public function generarFolio($idProyecto) {
        $folio = 1;
        $query = 'SELECT MAX(folio) as maxFolio FROM jira_tareas WHERE idProyecto = ' . intval($idProyecto) . ';';

        $this->open();
        if ($result = mysqli_query($this->Connection, $query)) {
            $row = $result->fetch_array(MYSQLI_ASSOC);
            if ($row['maxFolio']) {
                $folio = intval($row['maxFolio']) + 1;
            }
        }
        $this->closet();

        return $folio;
    }

    public function crear($datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['idTarea'] = 0;

        session_start();
        $DATE = date('Y-m-d H:i:s');
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $idProyecto = intval($datos['idProyecto']);
        $folio = $this->generarFolio($idProyecto);

        $this->open();

        // Si no hay idFase, obtener fase inicial
        $idFase = isset($datos['idFase']) ? intval($datos['idFase']) : 0;
        if (!$idFase) {
            $queryFase = "SELECT idFase FROM jira_fases WHERE idProyecto = $idProyecto AND esInicial = 1 AND bstate = 1 LIMIT 1;";
            if ($resultFase = mysqli_query($this->Connection, $queryFase)) {
                if ($row = $resultFase->fetch_array(MYSQLI_ASSOC)) {
                    $idFase = $row['idFase'];
                }
            }
        }

        // Obtener orden maximo en la fase
        $queryOrden = "SELECT COALESCE(MAX(orden), 0) + 1 as nuevoOrden FROM jira_tareas WHERE idFase = $idFase AND bstate = 1;";
        $resultOrden = mysqli_query($this->Connection, $queryOrden);
        $orden = 1;
        if ($resultOrden && $row = $resultOrden->fetch_array(MYSQLI_ASSOC)) {
            $orden = $row['nuevoOrden'];
        }

        $titulo = mysqli_real_escape_string($this->Connection, $datos['titulo']);
        $descripcion = mysqli_real_escape_string($this->Connection, $datos['descripcion'] ?? '');
        $prioridad = mysqli_real_escape_string($this->Connection, $datos['prioridad'] ?? 'MEDIA');
        $fechaInicio = isset($datos['fechaInicio']) && $datos['fechaInicio'] ? "'" . $datos['fechaInicio'] . "'" : "NULL";
        $fechaVencimiento = isset($datos['fechaVencimiento']) && $datos['fechaVencimiento'] ? "'" . $datos['fechaVencimiento'] . "'" : "NULL";
        $idUsuarioAsignado = isset($datos['idUsuarioAsignado']) && $datos['idUsuarioAsignado'] ? intval($datos['idUsuarioAsignado']) : 'NULL';

        $queryInsert = "INSERT INTO jira_tareas (
            folio, idProyecto, idFase, titulo, descripcion, prioridad,
            fechaInicio, fechaVencimiento, orden, idUsuarioAsignado, idUsuarioCreador
        ) VALUES (
            $folio, $idProyecto, $idFase, '$titulo', '$descripcion', '$prioridad',
            $fechaInicio, $fechaVencimiento, $orden, $idUsuarioAsignado, $idUser
        );";

        if (mysqli_query($this->Connection, $queryInsert)) {
            $JSON_RESULT['idTarea'] = mysqli_insert_id($this->Connection);
            $JSON_RESULT['message'] = "Good";

            $this->registrarHistorial($JSON_RESULT['idTarea'], $idUser, 'CREAR_TAREA', '', $titulo);
            $this->enviarNotificacionProyecto($idProyecto, 'Nueva tarea creada: ' . $titulo);
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function actualizar($idTarea, $datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $DATE = date('Y-m-d H:i:s');
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $this->open();

        $campos = [];
        if (isset($datos['titulo'])) {
            $titulo = mysqli_real_escape_string($this->Connection, $datos['titulo']);
            $campos[] = "titulo = '$titulo'";
        }
        if (isset($datos['descripcion'])) {
            $descripcion = mysqli_real_escape_string($this->Connection, $datos['descripcion']);
            $campos[] = "descripcion = '$descripcion'";
        }
        if (isset($datos['prioridad'])) {
            $prioridad = mysqli_real_escape_string($this->Connection, $datos['prioridad']);
            $campos[] = "prioridad = '$prioridad'";
        }
        if (isset($datos['fechaInicio'])) {
            $campos[] = $datos['fechaInicio'] ? "fechaInicio = '" . $datos['fechaInicio'] . "'" : "fechaInicio = NULL";
        }
        if (isset($datos['fechaVencimiento'])) {
            $campos[] = $datos['fechaVencimiento'] ? "fechaVencimiento = '" . $datos['fechaVencimiento'] . "'" : "fechaVencimiento = NULL";
        }
        if (isset($datos['idUsuarioAsignado'])) {
            $idUsuarioAsignado = $datos['idUsuarioAsignado'] ? intval($datos['idUsuarioAsignado']) : 'NULL';
            $campos[] = "idUsuarioAsignado = $idUsuarioAsignado";
        }

        if (count($campos) > 0) {
            $queryUpdate = "UPDATE jira_tareas SET " . implode(', ', $campos) .
                           " WHERE idTarea = " . intval($idTarea) . ";";

            if (mysqli_query($this->Connection, $queryUpdate)) {
                $JSON_RESULT['message'] = "Good";
                $this->registrarHistorial($idTarea, $idUser, 'ACTUALIZAR_TAREA', '', '');
            } else {
                $JSON_RESULT['message'] = "Bad";
                $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
            }
        } else {
            $JSON_RESULT['message'] = "Good";
        }

        $this->closet();

        return $JSON_RESULT;
    }

    public function moverTarea($idTarea, $idFaseDestino, $orden = null) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $this->open();

        // Obtener info de fase destino
        $queryFase = "SELECT nombre FROM jira_fases WHERE idFase = " . intval($idFaseDestino) . ";";
        $resultFase = mysqli_query($this->Connection, $queryFase);
        $nombreFase = '';
        if ($resultFase && $row = $resultFase->fetch_array(MYSQLI_ASSOC)) {
            $nombreFase = $row['nombre'];
        }

        // Si no se especifica orden, poner al final
        if ($orden === null) {
            $queryOrden = "SELECT COALESCE(MAX(orden), 0) + 1 as nuevoOrden FROM jira_tareas WHERE idFase = " . intval($idFaseDestino) . " AND bstate = 1;";
            $resultOrden = mysqli_query($this->Connection, $queryOrden);
            if ($resultOrden && $row = $resultOrden->fetch_array(MYSQLI_ASSOC)) {
                $orden = $row['nuevoOrden'];
            } else {
                $orden = 1;
            }
        }

        $queryUpdate = "UPDATE jira_tareas SET idFase = " . intval($idFaseDestino) . ", orden = " . intval($orden) . " WHERE idTarea = " . intval($idTarea) . ";";

        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";

            // Agregar comentario automatico
            $this->agregarComentarioInterno($idTarea, $idUser, 'Tarea movida a: ' . $nombreFase, 'CAMBIO_FASE');

            // Registrar historial
            $this->registrarHistorial($idTarea, $idUser, 'MOVER_FASE', '', $nombreFase);

            // Obtener proyecto para notificacion
            $queryProyecto = "SELECT idProyecto, titulo FROM jira_tareas WHERE idTarea = " . intval($idTarea) . ";";
            if ($resultP = mysqli_query($this->Connection, $queryProyecto)) {
                if ($rowP = $resultP->fetch_array(MYSQLI_ASSOC)) {
                    $this->enviarNotificacionProyecto($rowP['idProyecto'], 'Tarea "' . $rowP['titulo'] . '" movida a: ' . $nombreFase);
                }
            }
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }

        $this->closet();

        return $JSON_RESULT;
    }

    public function reordenarTareas($tareas) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        foreach ($tareas as $tarea) {
            $idTarea = intval($tarea['idTarea']);
            $idFase = intval($tarea['idFase']);
            $orden = intval($tarea['orden']);
            $query = "UPDATE jira_tareas SET idFase = $idFase, orden = $orden WHERE idTarea = $idTarea;";
            mysqli_query($this->Connection, $query);
        }
        $JSON_RESULT['message'] = "Good";
        $this->closet();

        return $JSON_RESULT;
    }

    public function eliminar($idTarea) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $this->open();
        $queryUpdate = "UPDATE jira_tareas SET bstate = 0 WHERE idTarea = " . intval($idTarea) . ";";
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
            $this->registrarHistorial($idTarea, $idUser, 'ELIMINAR_TAREA', '', '');
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // COMENTARIOS
    // ==========================================

    public function agregarComentario($idTarea, $comentario, $tipo = 'COMENTARIO') {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['idComentario'] = 0;

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $this->open();
        $result = $this->agregarComentarioInterno($idTarea, $idUser, $comentario, $tipo);
        $this->closet();

        if ($result) {
            $JSON_RESULT['idComentario'] = $result;
            $JSON_RESULT['message'] = "Good";

            // Notificar
            $queryTarea = "SELECT idProyecto, titulo FROM jira_tareas WHERE idTarea = " . intval($idTarea) . ";";
            $this->open();
            if ($resultT = mysqli_query($this->Connection, $queryTarea)) {
                if ($rowT = $resultT->fetch_array(MYSQLI_ASSOC)) {
                    $this->enviarNotificacionProyecto($rowT['idProyecto'], 'Nuevo comentario en: ' . $rowT['titulo']);
                }
            }
            $this->closet();
        } else {
            $JSON_RESULT['message'] = "Bad";
        }

        return $JSON_RESULT;
    }

    private function agregarComentarioInterno($idTarea, $idUser, $comentario, $tipo = 'COMENTARIO') {
        $comentarioEsc = mysqli_real_escape_string($this->Connection, $comentario);
        $queryInsert = "INSERT INTO jira_comentarios (idTarea, idUsuario, comentario, tipo) VALUES (" . intval($idTarea) . ", $idUser, '$comentarioEsc', '$tipo');";

        if (mysqli_query($this->Connection, $queryInsert)) {
            return mysqli_insert_id($this->Connection);
        }
        return false;
    }

    // ==========================================
    // ARCHIVOS
    // ==========================================

    public function agregarArchivo($datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['idArchivo'] = 0;

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $idTarea = intval($datos['idTarea']);
        $nombreOriginal = mysqli_real_escape_string($this->Connection, $datos['nombreOriginal']);
        $nombreArchivo = mysqli_real_escape_string($this->Connection, $datos['nombreArchivo']);
        $extension = mysqli_real_escape_string($this->Connection, $datos['extension']);
        $tamano = intval($datos['tamano']);
        $mimeType = mysqli_real_escape_string($this->Connection, $datos['mimeType']);
        $ruta = mysqli_real_escape_string($this->Connection, $datos['ruta']);

        $queryInsert = "INSERT INTO jira_archivos (idTarea, idUsuario, nombreOriginal, nombreArchivo, extension, tamano, mimeType, ruta)
                        VALUES ($idTarea, $idUser, '$nombreOriginal', '$nombreArchivo', '$extension', $tamano, '$mimeType', '$ruta');";

        $this->open();
        if (mysqli_query($this->Connection, $queryInsert)) {
            $JSON_RESULT['idArchivo'] = mysqli_insert_id($this->Connection);
            $JSON_RESULT['message'] = "Good";

            // Agregar comentario automatico
            $this->agregarComentarioInterno($idTarea, $idUser, 'Archivo adjunto: ' . $nombreOriginal, 'ARCHIVO');

            // Historial
            $this->registrarHistorial($idTarea, $idUser, 'SUBIR_ARCHIVO', '', $nombreOriginal);
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function eliminarArchivo($idArchivo) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        $queryUpdate = "UPDATE jira_archivos SET bstate = 0 WHERE idArchivo = " . intval($idArchivo) . ";";
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // CALENDARIO
    // ==========================================

    public function getCalendario($mes = null, $anio = null) {
        $JSON_RESULT = [];
        $JSON_RESULT['eventos'] = [];
        $JSON_RESULT['message'] = '';

        $mes = $mes ?? date('m');
        $anio = $anio ?? date('Y');

        $querySelect = "SELECT t.*, p.nombre as nombreProyecto, p.color as colorProyecto, f.nombre as nombreFase
                        FROM jira_tareas t
                        INNER JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
                        INNER JOIN jira_fases f ON t.idFase = f.idFase
                        WHERE t.bstate = 1
                        AND (MONTH(t.fechaVencimiento) = $mes AND YEAR(t.fechaVencimiento) = $anio)
                        ORDER BY t.fechaVencimiento;";

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['eventos'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    public function getDashboard() {
        $JSON_RESULT = [];
        $JSON_RESULT['estadisticas'] = [];
        $JSON_RESULT['message'] = '';

        $this->open();

        // Total tareas
        $query = "SELECT COUNT(*) as total FROM jira_tareas WHERE bstate = 1;";
        if ($result = mysqli_query($this->Connection, $query)) {
            $row = $result->fetch_array(MYSQLI_ASSOC);
            $JSON_RESULT['estadisticas']['totalTareas'] = intval($row['total']);
        }

        // Tareas por fase
        $query = "SELECT f.nombre, f.color, COUNT(t.idTarea) as total
                  FROM jira_fases f
                  LEFT JOIN jira_tareas t ON f.idFase = t.idFase AND t.bstate = 1
                  WHERE f.bstate = 1
                  GROUP BY f.idFase
                  ORDER BY f.orden;";
        $JSON_RESULT['estadisticas']['porFase'] = [];
        if ($result = mysqli_query($this->Connection, $query)) {
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['estadisticas']['porFase'], $row);
            }
        }

        // Tareas vencidas
        $DATE = date('Y-m-d');
        $query = "SELECT COUNT(*) as total FROM jira_tareas t
                  INNER JOIN jira_fases f ON t.idFase = f.idFase
                  WHERE t.bstate = 1 AND f.esFinal = 0 AND t.fechaVencimiento < '$DATE';";
        if ($result = mysqli_query($this->Connection, $query)) {
            $row = $result->fetch_array(MYSQLI_ASSOC);
            $JSON_RESULT['estadisticas']['vencidas'] = intval($row['total']);
        }

        // Por prioridad
        $query = "SELECT prioridad, COUNT(*) as total FROM jira_tareas WHERE bstate = 1 GROUP BY prioridad;";
        $JSON_RESULT['estadisticas']['porPrioridad'] = [];
        if ($result = mysqli_query($this->Connection, $query)) {
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['estadisticas']['porPrioridad'], $row);
            }
        }

        $JSON_RESULT['message'] = "Good";
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    private function registrarHistorial($idTarea, $idUsuario, $accion, $valorAnterior, $valorNuevo) {
        $valorAnteriorEsc = mysqli_real_escape_string($this->Connection, $valorAnterior);
        $valorNuevoEsc = mysqli_real_escape_string($this->Connection, $valorNuevo);

        $query = "INSERT INTO jira_historial (idTarea, idUsuario, accion, valorAnterior, valorNuevo)
                  VALUES (" . intval($idTarea) . ", " . intval($idUsuario) . ", '$accion', '$valorAnteriorEsc', '$valorNuevoEsc');";

        mysqli_query($this->Connection, $query);
    }

    private function enviarNotificacionProyecto($idProyecto, $mensaje) {
        // Obtener email del cliente del proyecto
        $query = "SELECT u.email, u.nombre, p.nombre as nombreProyecto
                  FROM usuarios u
                  INNER JOIN jira_proyectos p ON u.idUsuario = p.idUsuario
                  WHERE p.idProyecto = " . intval($idProyecto) . ";";

        if ($result = mysqli_query($this->Connection, $query)) {
            if ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $to = $row['email'];
                $subject = "Actualizacion en Proyecto: " . $row['nombreProyecto'];
                $body = "
                    <h2>Notificacion de Proyecto</h2>
                    <p><strong>Proyecto:</strong> " . $row['nombreProyecto'] . "</p>
                    <p><strong>Mensaje:</strong> $mensaje</p>
                ";

                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-type: text/html; charset=UTF-8\r\n";
                $headers .= "From: noreply@sistema.com\r\n";

                @mail($to, $subject, $body, $headers);
            }
        }
    }

    // ==========================================
    // NOTAS DEL CALENDARIO
    // ==========================================

    public function selectNotasCalendario($mes = null, $anio = null) {
        $JSON_RESULT = [];
        $JSON_RESULT['notas'] = [];
        $JSON_RESULT['message'] = '';

        $mes = $mes ?? date('m');
        $anio = $anio ?? date('Y');

        $querySelect = "SELECT * FROM jira_notas_calendario_view
                        WHERE MONTH(fecha) = $mes AND YEAR(fecha) = $anio
                        ORDER BY fecha, fechaCreacion;";

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['notas'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function crearNota($datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['idNota'] = 0;

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $this->open();

        $fecha = mysqli_real_escape_string($this->Connection, $datos['fecha']);
        $titulo = mysqli_real_escape_string($this->Connection, $datos['titulo']);
        $contenido = mysqli_real_escape_string($this->Connection, $datos['contenido'] ?? '');
        $color = mysqli_real_escape_string($this->Connection, $datos['color'] ?? '#FFC107');
        $icono = mysqli_real_escape_string($this->Connection, $datos['icono'] ?? 'mdi:note-outline');
        $recordatorio = isset($datos['recordatorio']) && $datos['recordatorio'] ? 1 : 0;
        $horaRecordatorio = isset($datos['horaRecordatorio']) && $datos['horaRecordatorio']
            ? "'" . mysqli_real_escape_string($this->Connection, $datos['horaRecordatorio']) . "'"
            : "NULL";

        $queryInsert = "INSERT INTO jira_notas_calendario (
            fecha, titulo, contenido, color, icono, idUsuarioCreador, recordatorio, horaRecordatorio
        ) VALUES (
            '$fecha', '$titulo', '$contenido', '$color', '$icono', $idUser, $recordatorio, $horaRecordatorio
        );";

        if (mysqli_query($this->Connection, $queryInsert)) {
            $JSON_RESULT['idNota'] = mysqli_insert_id($this->Connection);
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function actualizarNota($idNota, $datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();

        $campos = [];
        if (isset($datos['titulo'])) {
            $titulo = mysqli_real_escape_string($this->Connection, $datos['titulo']);
            $campos[] = "titulo = '$titulo'";
        }
        if (isset($datos['contenido'])) {
            $contenido = mysqli_real_escape_string($this->Connection, $datos['contenido']);
            $campos[] = "contenido = '$contenido'";
        }
        if (isset($datos['color'])) {
            $color = mysqli_real_escape_string($this->Connection, $datos['color']);
            $campos[] = "color = '$color'";
        }
        if (isset($datos['icono'])) {
            $icono = mysqli_real_escape_string($this->Connection, $datos['icono']);
            $campos[] = "icono = '$icono'";
        }
        if (isset($datos['fecha'])) {
            $fecha = mysqli_real_escape_string($this->Connection, $datos['fecha']);
            $campos[] = "fecha = '$fecha'";
        }
        if (isset($datos['recordatorio'])) {
            $recordatorio = $datos['recordatorio'] ? 1 : 0;
            $campos[] = "recordatorio = $recordatorio";
        }
        if (isset($datos['horaRecordatorio'])) {
            $horaRecordatorio = $datos['horaRecordatorio']
                ? "'" . mysqli_real_escape_string($this->Connection, $datos['horaRecordatorio']) . "'"
                : "NULL";
            $campos[] = "horaRecordatorio = $horaRecordatorio";
        }

        if (count($campos) > 0) {
            $queryUpdate = "UPDATE jira_notas_calendario SET " . implode(', ', $campos) .
                           " WHERE idNota = " . intval($idNota) . ";";

            if (mysqli_query($this->Connection, $queryUpdate)) {
                $JSON_RESULT['message'] = "Good";
            } else {
                $JSON_RESULT['message'] = "Bad";
                $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
            }
        } else {
            $JSON_RESULT['message'] = "Good";
        }

        $this->closet();

        return $JSON_RESULT;
    }

    public function eliminarNota($idNota) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        $queryUpdate = "UPDATE jira_notas_calendario SET bstate = 0 WHERE idNota = " . intval($idNota) . ";";
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    public function getNotaPorId($idNota) {
        $JSON_RESULT = [];
        $JSON_RESULT['nota'] = null;
        $JSON_RESULT['message'] = '';

        $this->open();
        $querySelect = "SELECT * FROM jira_notas_calendario_view WHERE idNota = " . intval($idNota) . ";";
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            if ($resultQuery->num_rows > 0) {
                $JSON_RESULT['nota'] = $resultQuery->fetch_array(MYSQLI_ASSOC);
                $JSON_RESULT['message'] = "Good";
            } else {
                $JSON_RESULT['message'] = "NotFound";
            }
        } else {
            $JSON_RESULT['message'] = "Bad";
        }
        $this->closet();

        return $JSON_RESULT;
    }
}

?>
