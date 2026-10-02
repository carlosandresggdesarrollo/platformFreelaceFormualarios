<?php

namespace administrador\Modules\ModuleClienteDashboard\Model;

include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection;

class ClienteDashboardModel extends Conection {

    public function __construct() {
        parent::__construct();
    }

    private function parseUserAgent() {
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $navegador = 'Otro';
        $dispositivo = 'Desktop';
        $so = 'Otro';

        if (preg_match('/Chrome/i', $ua) && !preg_match('/Edge|OPR/i', $ua)) $navegador = 'Chrome';
        elseif (preg_match('/Firefox/i', $ua)) $navegador = 'Firefox';
        elseif (preg_match('/Safari/i', $ua) && !preg_match('/Chrome/i', $ua)) $navegador = 'Safari';
        elseif (preg_match('/Edge|Edg/i', $ua)) $navegador = 'Edge';
        elseif (preg_match('/OPR|Opera/i', $ua)) $navegador = 'Opera';

        if (preg_match('/Mobile|Android.*Mobile|iPhone/i', $ua)) $dispositivo = 'Mobile';
        elseif (preg_match('/Tablet|iPad/i', $ua)) $dispositivo = 'Tablet';

        if (preg_match('/Windows/i', $ua)) $so = 'Windows';
        elseif (preg_match('/Mac/i', $ua)) $so = 'macOS';
        elseif (preg_match('/Linux/i', $ua)) $so = 'Linux';
        elseif (preg_match('/Android/i', $ua)) $so = 'Android';
        elseif (preg_match('/iOS|iPhone|iPad/i', $ua)) $so = 'iOS';

        return ['navegador' => $navegador, 'dispositivo' => $dispositivo, 'so' => $so];
    }

    // ================================================================
    //  LOGIN TRACKING
    // ================================================================

    public function registrarLogin($idUsuario) {
        $ip = $_SERVER['HTTP_CLIENT_IP']
            ?? $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['REMOTE_ADDR']
            ?? '';
        $ua = $this->parseUserAgent();

        $this->open();
        $stmt = $this->Connection->prepare(
            "INSERT INTO sesiones_login (idUsuario, ip, navegador, dispositivo, sistemaOperativo)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->bind_param('issss', $idUsuario, $ip, $ua['navegador'], $ua['dispositivo'], $ua['so']);
        $stmt->execute();
        $stmt->close();
        $this->closet();
    }

    // ================================================================
    //  ADMIN: Estadisticas de login
    // ================================================================

    public function getLoginStatsAdmin() {
        $result = [];
        $this->open();

        $q = "SELECT u.idUsuario, u.nombre, u.apellidos, u.email, u.usuario, u.estatus,
                     u.fechaCreacion, u.tipoUsuario,
                     COUNT(s.idSesionLogin) AS totalLogins,
                     MAX(s.fechaLogin) AS ultimoLogin
              FROM usuarios u
              LEFT JOIN sesiones_login s ON u.idUsuario = s.idUsuario
              WHERE u.tipoUsuario = 'CLIENTE' AND u.bstate = 1
              GROUP BY u.idUsuario
              ORDER BY u.fechaCreacion DESC";

        if ($res = mysqli_query($this->Connection, $q)) {
            while ($row = $res->fetch_assoc()) {
                $result[] = $row;
            }
        }
        $this->closet();
        return $result;
    }

    public function getLoginHistoryByUser($idUsuario, $limit = 50) {
        $result = [];
        $this->open();
        $stmt = $this->Connection->prepare(
            "SELECT ip, navegador, dispositivo, sistemaOperativo, fechaLogin
             FROM sesiones_login WHERE idUsuario = ? ORDER BY fechaLogin DESC LIMIT ?"
        );
        $stmt->bind_param('ii', $idUsuario, $limit);
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $result[] = $row;
        }
        $stmt->close();
        $this->closet();
        return $result;
    }

    public function getLoginResumen() {
        $result = ['hoy' => 0, 'semana' => 0, 'mes' => 0, 'total' => 0];
        $this->open();

        $q = "SELECT
                SUM(DATE(fechaLogin) = CURDATE()) AS hoy,
                SUM(fechaLogin >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS semana,
                SUM(fechaLogin >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS mes,
                COUNT(*) AS total
              FROM sesiones_login
              JOIN usuarios u ON sesiones_login.idUsuario = u.idUsuario
              WHERE u.tipoUsuario = 'CLIENTE'";

        if ($res = mysqli_query($this->Connection, $q)) {
            if ($row = $res->fetch_assoc()) {
                $result = [
                    'hoy' => (int)$row['hoy'],
                    'semana' => (int)$row['semana'],
                    'mes' => (int)$row['mes'],
                    'total' => (int)$row['total'],
                ];
            }
        }
        $this->closet();
        return $result;
    }

    // ================================================================
    //  CLIENTE: Mis cuestionarios resueltos
    // ================================================================

    public function getMisCuestionariosResueltos($idUsuario) {
        $result = [];
        $this->open();

        $q = "SELECT s.idSesion, s.idCuestionario, s.nombreParticipante, s.emailParticipante,
                     s.fechaInicio, s.fechaFin,
                     c.titulo, c.descripcion,
                     (SELECT COUNT(*) FROM cuestionario_preguntas WHERE idCuestionario = c.idCuestionario) AS totalPreguntas,
                     (SELECT COUNT(*) FROM cuestionario_respuestas r
                      JOIN cuestionario_opciones o ON r.idOpcion = o.idOpcion
                      WHERE r.idSesion = s.idSesion AND o.esCorrecta = 1) AS correctas
              FROM cuestionario_respuestas_sesion s
              JOIN cuestionarios c ON s.idCuestionario = c.idCuestionario
              WHERE s.idUsuario = $idUsuario
              ORDER BY s.fechaInicio DESC";

        if ($res = mysqli_query($this->Connection, $q)) {
            while ($row = $res->fetch_assoc()) {
                $result[] = $row;
            }
        }
        $this->closet();
        return $result;
    }

    public function getDetalleRespuestas($idSesion, $idUsuario) {
        $result = ['sesion' => null, 'preguntas' => []];
        $this->open();

        // Verify ownership
        $stmt = $this->Connection->prepare(
            "SELECT s.*, c.titulo, c.descripcion
             FROM cuestionario_respuestas_sesion s
             JOIN cuestionarios c ON s.idCuestionario = c.idCuestionario
             WHERE s.idSesion = ? AND s.idUsuario = ?"
        );
        $stmt->bind_param('ii', $idSesion, $idUsuario);
        $stmt->execute();
        $res = $stmt->get_result();
        $sesion = $res->fetch_assoc();
        $stmt->close();

        if (!$sesion) {
            $this->closet();
            return null;
        }
        $result['sesion'] = $sesion;

        $q = "SELECT p.idPregunta, p.textoPregunta,
                     o_sel.textoOpcion AS respuestaSeleccionada,
                     o_sel.esCorrecta,
                     o_cor.textoOpcion AS respuestaCorrecta
              FROM cuestionario_respuestas r
              JOIN cuestionario_preguntas p ON r.idPregunta = p.idPregunta
              JOIN cuestionario_opciones o_sel ON r.idOpcion = o_sel.idOpcion
              LEFT JOIN cuestionario_opciones o_cor ON o_cor.idPregunta = p.idPregunta AND o_cor.esCorrecta = 1
              WHERE r.idSesion = {$idSesion}
              ORDER BY p.orden";

        if ($res2 = mysqli_query($this->Connection, $q)) {
            while ($row = $res2->fetch_assoc()) {
                $result['preguntas'][] = $row;
            }
        }

        $this->closet();
        return $result;
    }

    // ================================================================
    //  JUEGO: Puntajes y ranking
    // ================================================================

    public function guardarPuntaje($idUsuario, $puntaje, $movimientos, $tiempo, $nivel = 'normal') {
        $this->open();
        $stmt = $this->Connection->prepare(
            "INSERT INTO juego_puntajes (idUsuario, juego, puntaje, movimientos, tiempoSegundos, nivel)
             VALUES (?, 'memoria', ?, ?, ?, ?)"
        );
        $stmt->bind_param('iiiis', $idUsuario, $puntaje, $movimientos, $tiempo, $nivel);
        $stmt->execute();
        $id = $stmt->insert_id;
        $stmt->close();
        $this->closet();
        return $id;
    }

    public function getRanking($limit = 50) {
        $result = [];
        $this->open();

        $q = "SELECT jp.idPuntaje, jp.idUsuario, jp.puntaje, jp.movimientos, jp.tiempoSegundos,
                     jp.nivel, jp.fechaJuego,
                     u.nombre, u.apellidos
              FROM juego_puntajes jp
              JOIN usuarios u ON jp.idUsuario = u.idUsuario
              WHERE jp.juego = 'memoria'
              ORDER BY jp.puntaje DESC, jp.tiempoSegundos ASC
              LIMIT $limit";

        if ($res = mysqli_query($this->Connection, $q)) {
            while ($row = $res->fetch_assoc()) {
                $result[] = $row;
            }
        }
        $this->closet();
        return $result;
    }

    public function getMisPuntajes($idUsuario) {
        $result = [];
        $this->open();

        $q = "SELECT puntaje, movimientos, tiempoSegundos, nivel, fechaJuego
              FROM juego_puntajes
              WHERE idUsuario = $idUsuario AND juego = 'memoria'
              ORDER BY puntaje DESC
              LIMIT 20";

        if ($res = mysqli_query($this->Connection, $q)) {
            while ($row = $res->fetch_assoc()) {
                $result[] = $row;
            }
        }
        $this->closet();
        return $result;
    }

    public function getMiMejorPuntaje($idUsuario) {
        $this->open();
        $q = "SELECT MAX(puntaje) AS mejor FROM juego_puntajes WHERE idUsuario = $idUsuario AND juego = 'memoria'";
        $mejor = 0;
        if ($res = mysqli_query($this->Connection, $q)) {
            if ($row = $res->fetch_assoc()) {
                $mejor = (int)$row['mejor'];
            }
        }
        $this->closet();
        return $mejor;
    }

    public function getMiPosicionRanking($idUsuario) {
        $mejor = $this->getMiMejorPuntaje($idUsuario);
        $this->open();
        $q = "SELECT COUNT(DISTINCT idUsuario) + 1 AS posicion
              FROM juego_puntajes
              WHERE juego = 'memoria'
              AND idUsuario != $idUsuario
              GROUP BY idUsuario
              HAVING MAX(puntaje) > $mejor";
        $pos = 0;
        if ($res = mysqli_query($this->Connection, $q)) {
            $pos = $res->num_rows + 1;
        }
        $this->closet();
        return $pos;
    }
}
