<?php

namespace administrador\Modules\ModuleCuestionarios\Model;

include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection;

class CuestionariosModel extends Conection
{
    public function __construct()
    {
        parent::__construct();
    }

    // ================================================================
    //  HELPER
    // ================================================================

    private function esc(string $v): string
    {
        return mysqli_real_escape_string($this->Connection, $v);
    }

    // ================================================================
    //  CRUD CUESTIONARIOS
    // ================================================================

    /**
     * Lista todos los cuestionarios con conteo de preguntas y sesiones de respuesta.
     */
    public function listarCuestionarios(): array
    {
        $result = [];
        try {
            $this->open();
            $q = "SELECT c.*,
                         (SELECT COUNT(*) FROM cuestionario_preguntas p WHERE p.idCuestionario = c.idCuestionario) AS totalPreguntas,
                         (SELECT COUNT(*) FROM cuestionario_respuestas_sesion s WHERE s.idCuestionario = c.idCuestionario) AS totalRespuestas
                  FROM cuestionarios c
                  ORDER BY c.fechaCreacion DESC";
            $r = mysqli_query($this->Connection, $q);
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $result[] = $row;
                }
            }
            $this->closet();
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return $result;
    }

    /**
     * Obtiene un cuestionario con todas sus preguntas y opciones estructuradas.
     */
    public function getCuestionario(int $id): array
    {
        try {
            $this->open();
            $id = intval($id);

            // Cuestionario
            $r = mysqli_query($this->Connection, "SELECT * FROM cuestionarios WHERE idCuestionario = $id");
            if (!$r || $r->num_rows === 0) {
                $this->closet();
                return ['success' => false, 'error' => 'Cuestionario no encontrado'];
            }
            $cuestionario = $r->fetch_assoc();

            // Preguntas
            $cuestionario['preguntas'] = [];
            $rP = mysqli_query($this->Connection,
                "SELECT * FROM cuestionario_preguntas WHERE idCuestionario = $id ORDER BY orden ASC");
            if ($rP) {
                while ($pregunta = $rP->fetch_assoc()) {
                    $idPregunta = intval($pregunta['idPregunta']);
                    $pregunta['opciones'] = [];
                    $rO = mysqli_query($this->Connection,
                        "SELECT idOpcion, textoOpcion, orden, esCorrecta
                         FROM cuestionario_opciones
                         WHERE idPregunta = $idPregunta
                         ORDER BY orden ASC");
                    if ($rO) {
                        while ($opcion = $rO->fetch_assoc()) {
                            $pregunta['opciones'][] = $opcion;
                        }
                    }
                    $cuestionario['preguntas'][] = $pregunta;
                }
            }

            $this->closet();
            return $cuestionario;
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Crea un nuevo cuestionario.
     */
    public function crearCuestionario(string $titulo, string $descripcion, int $creadoPor): array
    {
        try {
            $this->open();
            $titulo      = $this->esc($titulo);
            $descripcion = $this->esc($descripcion);
            $creadoPor   = intval($creadoPor);
            $fecha       = date('Y-m-d H:i:s');

            $q = "INSERT INTO cuestionarios (titulo, descripcion, estado, creadoPor, fechaCreacion, fechaActualizacion)
                  VALUES ('$titulo', '$descripcion', 'borrador', $creadoPor, '$fecha', '$fecha')";
            if (mysqli_query($this->Connection, $q)) {
                $idCuestionario = (int) mysqli_insert_id($this->Connection);
                $this->closet();
                return ['success' => true, 'idCuestionario' => $idCuestionario];
            } else {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Actualiza titulo, descripcion y estado de un cuestionario.
     */
    public function actualizarCuestionario(int $id, string $titulo, string $descripcion, string $estado): array
    {
        try {
            $this->open();
            $id          = intval($id);
            $titulo      = $this->esc($titulo);
            $descripcion = $this->esc($descripcion);
            $estado      = $this->esc($estado);
            $fecha       = date('Y-m-d H:i:s');

            $q = "UPDATE cuestionarios
                  SET titulo = '$titulo', descripcion = '$descripcion', estado = '$estado', fechaActualizacion = '$fecha'
                  WHERE idCuestionario = $id";
            if (mysqli_query($this->Connection, $q)) {
                $this->closet();
                return ['success' => true];
            } else {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Elimina un cuestionario (CASCADE maneja hijos).
     */
    public function eliminarCuestionario(int $id): array
    {
        try {
            $this->open();
            $id = intval($id);
            $q  = "DELETE FROM cuestionarios WHERE idCuestionario = $id";
            if (mysqli_query($this->Connection, $q)) {
                $this->closet();
                return ['success' => true];
            } else {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ================================================================
    //  CRUD PREGUNTAS / OPCIONES
    // ================================================================

    /**
     * Agrega una pregunta con sus opciones a un cuestionario.
     * $opciones = [ ['texto' => '...', 'esCorrecta' => 0|1], ... ]
     */
    public function agregarPregunta(int $idCuestionario, string $texto, int $orden, array $opciones, string $tipo = 'opcion_multiple'): array
    {
        try {
            $this->open();
            $idCuestionario = intval($idCuestionario);
            $texto          = $this->esc($texto);
            $orden          = intval($orden);
            $tipoEsc        = in_array($tipo, ['opcion_multiple', 'abierta']) ? $tipo : 'opcion_multiple';

            $qP = "INSERT INTO cuestionario_preguntas (idCuestionario, textoPregunta, orden, tipoPregunta)
                   VALUES ($idCuestionario, '$texto', $orden, '$tipoEsc')";
            if (!mysqli_query($this->Connection, $qP)) {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
            $idPregunta = (int) mysqli_insert_id($this->Connection);

            // Insertar opciones
            foreach ($opciones as $i => $opcion) {
                $textoOp    = $this->esc($opcion['texto'] ?? '');
                $esCorrecta = intval($opcion['esCorrecta'] ?? 0);
                $ordenOp    = $i + 1;
                $qO = "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, orden, esCorrecta)
                       VALUES ($idPregunta, '$textoOp', $ordenOp, $esCorrecta)";
                mysqli_query($this->Connection, $qO);
            }

            // Actualizar fecha del cuestionario
            $fecha = date('Y-m-d H:i:s');
            mysqli_query($this->Connection,
                "UPDATE cuestionarios SET fechaActualizacion = '$fecha' WHERE idCuestionario = $idCuestionario");

            $this->closet();
            return ['success' => true, 'idPregunta' => $idPregunta];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Actualiza el texto de una pregunta y reemplaza todas sus opciones.
     */
    public function actualizarPregunta(int $idPregunta, string $texto, array $opciones, string $tipo = 'opcion_multiple'): array
    {
        try {
            $this->open();
            $idPregunta = intval($idPregunta);
            $texto      = $this->esc($texto);
            $tipoEsc    = in_array($tipo, ['opcion_multiple', 'abierta']) ? $tipo : 'opcion_multiple';

            // Actualizar texto y tipo de la pregunta
            $qU = "UPDATE cuestionario_preguntas SET textoPregunta = '$texto', tipoPregunta = '$tipoEsc' WHERE idPregunta = $idPregunta";
            if (!mysqli_query($this->Connection, $qU)) {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }

            // Eliminar opciones antiguas
            mysqli_query($this->Connection, "DELETE FROM cuestionario_opciones WHERE idPregunta = $idPregunta");

            // Insertar nuevas opciones
            foreach ($opciones as $i => $opcion) {
                $textoOp    = $this->esc($opcion['texto'] ?? '');
                $esCorrecta = intval($opcion['esCorrecta'] ?? 0);
                $ordenOp    = $i + 1;
                $qO = "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, orden, esCorrecta)
                       VALUES ($idPregunta, '$textoOp', $ordenOp, $esCorrecta)";
                mysqli_query($this->Connection, $qO);
            }

            // Actualizar fecha del cuestionario padre
            $fecha = date('Y-m-d H:i:s');
            $rP = mysqli_query($this->Connection,
                "SELECT idCuestionario FROM cuestionario_preguntas WHERE idPregunta = $idPregunta");
            if ($rP && $row = $rP->fetch_assoc()) {
                mysqli_query($this->Connection,
                    "UPDATE cuestionarios SET fechaActualizacion = '$fecha' WHERE idCuestionario = " . intval($row['idCuestionario']));
            }

            $this->closet();
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Elimina una pregunta (y sus opciones por CASCADE).
     */
    public function eliminarPregunta(int $idPregunta): array
    {
        try {
            $this->open();
            $idPregunta = intval($idPregunta);

            // Obtener cuestionario padre antes de eliminar
            $rP = mysqli_query($this->Connection,
                "SELECT idCuestionario FROM cuestionario_preguntas WHERE idPregunta = $idPregunta");
            $idCuestionario = 0;
            if ($rP && $row = $rP->fetch_assoc()) {
                $idCuestionario = intval($row['idCuestionario']);
            }

            $q = "DELETE FROM cuestionario_preguntas WHERE idPregunta = $idPregunta";
            if (mysqli_query($this->Connection, $q)) {
                // Actualizar fecha del cuestionario padre
                if ($idCuestionario > 0) {
                    $fecha = date('Y-m-d H:i:s');
                    mysqli_query($this->Connection,
                        "UPDATE cuestionarios SET fechaActualizacion = '$fecha' WHERE idCuestionario = $idCuestionario");
                }
                $this->closet();
                return ['success' => true];
            } else {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ================================================================
    //  BULK IMPORT (para IA)
    // ================================================================

    /**
     * Importa un cuestionario completo con todas sus preguntas y opciones.
     * $preguntas = [ ['texto' => '...', 'opciones' => [ ['texto' => '...', 'esCorrecta' => 0|1], ... ]], ... ]
     */
    public function importarCuestionarioCompleto(string $titulo, string $descripcion, array $preguntas, int $creadoPor): array
    {
        try {
            $this->open();
            $titulo      = $this->esc($titulo);
            $descripcion = $this->esc($descripcion);
            $creadoPor   = intval($creadoPor);
            $fecha       = date('Y-m-d H:i:s');

            // Crear cuestionario
            $qC = "INSERT INTO cuestionarios (titulo, descripcion, estado, creadoPor, fechaCreacion, fechaActualizacion)
                   VALUES ('$titulo', '$descripcion', 'borrador', $creadoPor, '$fecha', '$fecha')";
            if (!mysqli_query($this->Connection, $qC)) {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
            $idCuestionario = (int) mysqli_insert_id($this->Connection);

            // Insertar preguntas con sus opciones
            foreach ($preguntas as $ordenP => $pregunta) {
                $textoPregunta = $this->esc($pregunta['texto'] ?? '');
                $ordenPregunta = intval($ordenP) + 1;

                $qP = "INSERT INTO cuestionario_preguntas (idCuestionario, textoPregunta, orden)
                       VALUES ($idCuestionario, '$textoPregunta', $ordenPregunta)";
                if (!mysqli_query($this->Connection, $qP)) {
                    continue;
                }
                $idPregunta = (int) mysqli_insert_id($this->Connection);

                $opcionesArr = $pregunta['opciones'] ?? [];
                foreach ($opcionesArr as $ordenO => $opcion) {
                    $textoOp    = $this->esc($opcion['texto'] ?? '');
                    $esCorrecta = intval($opcion['esCorrecta'] ?? 0);
                    $ordenOpcion = intval($ordenO) + 1;

                    $qO = "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, orden, esCorrecta)
                           VALUES ($idPregunta, '$textoOp', $ordenOpcion, $esCorrecta)";
                    mysqli_query($this->Connection, $qO);
                }
            }

            $this->closet();
            return ['success' => true, 'idCuestionario' => $idCuestionario];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ================================================================
    //  PUBLIC (participantes)
    // ================================================================

    /**
     * Lista cuestionarios publicados con conteo de preguntas.
     */
    public function getCuestionariosPublicados(): array
    {
        $result = [];
        try {
            $this->open();
            $q = "SELECT c.idCuestionario, c.titulo, c.descripcion, c.fechaCreacion,
                         (SELECT COUNT(*) FROM cuestionario_preguntas p WHERE p.idCuestionario = c.idCuestionario) AS totalPreguntas
                  FROM cuestionarios c
                  WHERE c.estado = 'publicado'
                  ORDER BY c.fechaCreacion DESC";
            $r = mysqli_query($this->Connection, $q);
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $result[] = $row;
                }
            }
            $this->closet();
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return $result;
    }

    /**
     * Obtiene un cuestionario publicado con preguntas y opciones SIN revelar esCorrecta.
     */
    public function getCuestionarioPublico(int $id): array
    {
        try {
            $this->open();
            $id = intval($id);

            // Verificar que esta publicado
            $r = mysqli_query($this->Connection,
                "SELECT idCuestionario, titulo, descripcion, fechaCreacion
                 FROM cuestionarios
                 WHERE idCuestionario = $id AND estado = 'publicado'");
            if (!$r || $r->num_rows === 0) {
                $this->closet();
                return ['success' => false, 'error' => 'Cuestionario no disponible'];
            }
            $cuestionario = $r->fetch_assoc();

            // Preguntas
            $cuestionario['preguntas'] = [];
            $rP = mysqli_query($this->Connection,
                "SELECT idPregunta, textoPregunta, orden, tipoPregunta
                 FROM cuestionario_preguntas
                 WHERE idCuestionario = $id
                 ORDER BY orden ASC");
            if ($rP) {
                while ($pregunta = $rP->fetch_assoc()) {
                    $idPregunta = intval($pregunta['idPregunta']);
                    $pregunta['opciones'] = [];
                    if ($pregunta['tipoPregunta'] !== 'abierta') {
                        $rO = mysqli_query($this->Connection,
                            "SELECT idOpcion, textoOpcion, orden
                             FROM cuestionario_opciones
                             WHERE idPregunta = $idPregunta
                             ORDER BY orden ASC");
                        if ($rO) {
                            while ($opcion = $rO->fetch_assoc()) {
                                $pregunta['opciones'][] = $opcion;
                            }
                        }
                    }
                    $cuestionario['preguntas'][] = $pregunta;
                }
            }

            $this->closet();
            return $cuestionario;
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Guarda las respuestas de un participante.
     * $respuestas = [ idPregunta => idOpcion|textoRespuesta, ... ]
     * $respuestasTexto = [ idPregunta => textoRespuesta, ... ] para preguntas abiertas
     */
    public function guardarRespuestas(int $idCuestionario, ?string $nombre, ?string $email, array $respuestas, array $respuestasTexto = [], ?int $idUsuario = null): array
    {
        try {
            $this->open();
            $idCuestionario = intval($idCuestionario);
            $nombreEsc      = $nombre !== null ? "'" . $this->esc($nombre) . "'" : 'NULL';
            $emailEsc       = $email !== null ? "'" . $this->esc($email) . "'" : 'NULL';
            $fechaInicio    = date('Y-m-d H:i:s');
            $idUsuarioVal   = $idUsuario !== null ? intval($idUsuario) : 'NULL';

            // Crear sesion
            $qS = "INSERT INTO cuestionario_respuestas_sesion (idCuestionario, idUsuario, nombreParticipante, emailParticipante, fechaInicio)
                   VALUES ($idCuestionario, $idUsuarioVal, $nombreEsc, $emailEsc, '$fechaInicio')";
            if (!mysqli_query($this->Connection, $qS)) {
                $error = mysqli_error($this->Connection);
                $this->closet();
                return ['success' => false, 'error' => $error];
            }
            $idSesion = (int) mysqli_insert_id($this->Connection);

            // Insertar respuestas de opcion multiple
            foreach ($respuestas as $idPregunta => $idOpcion) {
                $idP = intval($idPregunta);
                $idO = intval($idOpcion);
                $qR  = "INSERT INTO cuestionario_respuestas (idSesion, idPregunta, idOpcion)
                        VALUES ($idSesion, $idP, $idO)";
                mysqli_query($this->Connection, $qR);
            }

            // Insertar respuestas de texto (preguntas abiertas)
            foreach ($respuestasTexto as $idPregunta => $texto) {
                $idP = intval($idPregunta);
                $textoEsc = $this->esc($texto);
                $qR  = "INSERT INTO cuestionario_respuestas (idSesion, idPregunta, textoRespuesta)
                        VALUES ($idSesion, $idP, '$textoEsc')";
                mysqli_query($this->Connection, $qR);
            }

            // Actualizar fechaFin
            $fechaFin = date('Y-m-d H:i:s');
            mysqli_query($this->Connection,
                "UPDATE cuestionario_respuestas_sesion SET fechaFin = '$fechaFin' WHERE idSesion = $idSesion");

            // Calcular resultado: contar respuestas correctas
            $qResult = "SELECT
                            COUNT(*) AS total,
                            SUM(CASE WHEN o.esCorrecta = 1 THEN 1 ELSE 0 END) AS correctas
                        FROM cuestionario_respuestas r
                        INNER JOIN cuestionario_opciones o ON o.idOpcion = r.idOpcion
                        WHERE r.idSesion = $idSesion";
            $rResult = mysqli_query($this->Connection, $qResult);
            $resultado = ['total' => 0, 'correctas' => 0];
            if ($rResult && $row = $rResult->fetch_assoc()) {
                $resultado['total']     = (int) $row['total'];
                $resultado['correctas'] = (int) $row['correctas'];
            }

            $this->closet();
            return [
                'success'   => true,
                'idSesion'  => $idSesion,
                'resultado' => $resultado
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ================================================================
    //  ESTADISTICAS
    // ================================================================

    /**
     * Estadisticas completas de un cuestionario: participantes, y por cada pregunta
     * el desglose de respuestas por opcion con conteo y porcentaje.
     */
    public function getEstadisticas(int $idCuestionario): array
    {
        try {
            $this->open();
            $idCuestionario = intval($idCuestionario);

            // Info del cuestionario
            $rC = mysqli_query($this->Connection,
                "SELECT * FROM cuestionarios WHERE idCuestionario = $idCuestionario");
            if (!$rC || $rC->num_rows === 0) {
                $this->closet();
                return ['success' => false, 'error' => 'Cuestionario no encontrado'];
            }
            $cuestionario = $rC->fetch_assoc();

            // Total participantes
            $rT = mysqli_query($this->Connection,
                "SELECT COUNT(*) AS total FROM cuestionario_respuestas_sesion WHERE idCuestionario = $idCuestionario");
            $totalParticipantes = 0;
            if ($rT && $row = $rT->fetch_assoc()) {
                $totalParticipantes = (int) $row['total'];
            }

            // Preguntas con estadisticas
            $preguntas = [];
            $rP = mysqli_query($this->Connection,
                "SELECT idPregunta, textoPregunta, orden, tipoPregunta
                 FROM cuestionario_preguntas
                 WHERE idCuestionario = $idCuestionario
                 ORDER BY orden ASC");
            if ($rP) {
                while ($pregunta = $rP->fetch_assoc()) {
                    $idPregunta = intval($pregunta['idPregunta']);

                    // Total respuestas para esta pregunta
                    $rTR = mysqli_query($this->Connection,
                        "SELECT COUNT(*) AS total FROM cuestionario_respuestas WHERE idPregunta = $idPregunta");
                    $totalRespuestas = 0;
                    if ($rTR && $rowTR = $rTR->fetch_assoc()) {
                        $totalRespuestas = (int) $rowTR['total'];
                    }

                    if ($pregunta['tipoPregunta'] === 'abierta') {
                        // Recopilar respuestas de texto
                        $respuestasTexto = [];
                        $rRT = mysqli_query($this->Connection,
                            "SELECT r.textoRespuesta, s.nombreParticipante, s.fechaInicio
                             FROM cuestionario_respuestas r
                             INNER JOIN cuestionario_respuestas_sesion s ON s.idSesion = r.idSesion
                             WHERE r.idPregunta = $idPregunta AND r.textoRespuesta IS NOT NULL
                             ORDER BY s.fechaInicio DESC
                             LIMIT 50");
                        if ($rRT) {
                            while ($rt = $rRT->fetch_assoc()) {
                                $respuestasTexto[] = $rt;
                            }
                        }
                        $pregunta['totalRespuestas']  = $totalRespuestas;
                        $pregunta['opciones']         = [];
                        $pregunta['respuestasTexto']  = $respuestasTexto;
                    } else {
                        // Opciones con conteo de respuestas
                        $opciones = [];
                        $rO = mysqli_query($this->Connection,
                            "SELECT o.idOpcion, o.textoOpcion, o.orden, o.esCorrecta,
                                    COUNT(r.idRespuesta) AS conteo
                             FROM cuestionario_opciones o
                             LEFT JOIN cuestionario_respuestas r ON r.idOpcion = o.idOpcion
                             WHERE o.idPregunta = $idPregunta
                             GROUP BY o.idOpcion, o.textoOpcion, o.orden, o.esCorrecta
                             ORDER BY o.orden ASC");
                        if ($rO) {
                            while ($opcion = $rO->fetch_assoc()) {
                                $conteo = (int) $opcion['conteo'];
                                $opcion['conteo']     = $conteo;
                                $opcion['porcentaje'] = $totalRespuestas > 0
                                    ? round(($conteo / $totalRespuestas) * 100, 1)
                                    : 0;
                                $opciones[] = $opcion;
                            }
                        }
                        $pregunta['totalRespuestas'] = $totalRespuestas;
                        $pregunta['opciones']        = $opciones;
                    }

                    $preguntas[] = $pregunta;
                }
            }

            $this->closet();
            return [
                'success'            => true,
                'cuestionario'       => $cuestionario,
                'totalParticipantes' => $totalParticipantes,
                'preguntas'          => $preguntas
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ================================================================
    //  DASHBOARD STATS
    // ================================================================

    public function getDashboardStats(): array
    {
        try {
            $this->open();

            // Totales generales
            $rTotal = mysqli_query($this->Connection, "SELECT COUNT(*) AS total FROM cuestionarios");
            $totalCuestionarios = $rTotal && ($row = $rTotal->fetch_assoc()) ? (int) $row['total'] : 0;

            $rPub = mysqli_query($this->Connection, "SELECT COUNT(*) AS total FROM cuestionarios WHERE estado = 'publicado'");
            $totalPublicados = $rPub && ($row = $rPub->fetch_assoc()) ? (int) $row['total'] : 0;

            $rSes = mysqli_query($this->Connection, "SELECT COUNT(*) AS total FROM cuestionario_respuestas_sesion");
            $totalParticipaciones = $rSes && ($row = $rSes->fetch_assoc()) ? (int) $row['total'] : 0;

            // Participaciones de los ultimos 7 dias
            $rReciente = mysqli_query($this->Connection,
                "SELECT COUNT(*) AS total FROM cuestionario_respuestas_sesion WHERE fechaInicio >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            $participacionesRecientes = $rReciente && ($row = $rReciente->fetch_assoc()) ? (int) $row['total'] : 0;

            // Top 5 cuestionarios por participaciones
            $topCuestionarios = [];
            $rTop = mysqli_query($this->Connection,
                "SELECT c.idCuestionario, c.titulo, c.estado, c.fechaCreacion,
                        (SELECT COUNT(*) FROM cuestionario_preguntas p WHERE p.idCuestionario = c.idCuestionario) AS totalPreguntas,
                        COUNT(s.idSesion) AS totalParticipaciones
                 FROM cuestionarios c
                 LEFT JOIN cuestionario_respuestas_sesion s ON s.idCuestionario = c.idCuestionario
                 GROUP BY c.idCuestionario
                 ORDER BY totalParticipaciones DESC, c.fechaCreacion DESC
                 LIMIT 5");
            if ($rTop) {
                while ($row = $rTop->fetch_assoc()) {
                    $topCuestionarios[] = $row;
                }
            }

            // Participaciones por dia (ultimos 14 dias)
            $participacionesPorDia = [];
            $rPorDia = mysqli_query($this->Connection,
                "SELECT DATE(fechaInicio) AS fecha, COUNT(*) AS total
                 FROM cuestionario_respuestas_sesion
                 WHERE fechaInicio >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                 GROUP BY DATE(fechaInicio)
                 ORDER BY fecha ASC");
            if ($rPorDia) {
                while ($row = $rPorDia->fetch_assoc()) {
                    $participacionesPorDia[] = $row;
                }
            }

            $this->closet();
            return [
                'success'                  => true,
                'totalCuestionarios'       => $totalCuestionarios,
                'totalPublicados'          => $totalPublicados,
                'totalParticipaciones'     => $totalParticipaciones,
                'participacionesRecientes' => $participacionesRecientes,
                'topCuestionarios'         => $topCuestionarios,
                'participacionesPorDia'    => $participacionesPorDia,
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
