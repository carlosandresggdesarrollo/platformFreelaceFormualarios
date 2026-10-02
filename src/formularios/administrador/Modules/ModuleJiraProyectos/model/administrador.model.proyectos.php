<?php

namespace administrador\Modules\ModuleJiraProyectos\Model\proyectos;

include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection as Conection;

class proyectos extends Conection {

    public function __construct() {
        parent::__construct();
    }

    // Obtener todos los proyectos
    public function selectFull() {
        $JSON_RESULT = [];
        $JSON_RESULT['proyectos'] = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['error'] = '';

        $querySelect = 'SELECT * FROM jira_proyectos_view ORDER BY fechaCreacion DESC;';

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

    // Obtener un proyecto por ID
    public function selectOne($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['proyecto'] = null;
        $JSON_RESULT['message'] = '';

        $querySelect = 'SELECT * FROM jira_proyectos_view WHERE idProyecto = ' . intval($idProyecto) . ';';

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

    // Generar folio
    public function generarFolio() {
        $folio = 1;
        $query = 'SELECT MAX(folio) as maxFolio FROM jira_proyectos;';

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

    // Crear proyecto
    public function crear($datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';
        $JSON_RESULT['idProyecto'] = 0;

        session_start();
        $DATE = date('Y-m-d H:i:s');
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;
        $folio = $this->generarFolio();

        $nombre = mysqli_real_escape_string($this->Connection, $datos['nombre']);
        $descripcion = mysqli_real_escape_string($this->Connection, $datos['descripcion'] ?? '');
        $color = mysqli_real_escape_string($this->Connection, $datos['color'] ?? '#1976D2');
        $icono = mysqli_real_escape_string($this->Connection, $datos['icono'] ?? 'solar:folder-bold');
        $idUsuario = intval($datos['idUsuario'] ?? $idUser);
        $fechaInicio = $datos['fechaInicio'] ?? null;
        $fechaFin = $datos['fechaFin'] ?? null;

        $queryInsert = "INSERT INTO jira_proyectos (
            folio, nombre, descripcion, color, icono, idUsuario, estatus,
            fechaInicio, fechaFin, fechaCreacion, fechaModificacion, observacion, bstate
        ) VALUES (
            $folio,
            '$nombre',
            '$descripcion',
            '$color',
            '$icono',
            $idUsuario,
            'ACTIVO',
            " . ($fechaInicio ? "'$fechaInicio'" : "NULL") . ",
            " . ($fechaFin ? "'$fechaFin'" : "NULL") . ",
            '$DATE',
            '$DATE',
            '[INSERT $DATE] [idUser $idUser]',
            1
        );";

        $this->open();
        if (mysqli_query($this->Connection, $queryInsert)) {
            $JSON_RESULT['idProyecto'] = mysqli_insert_id($this->Connection);
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Actualizar proyecto
    public function actualizar($idProyecto, $datos) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $DATE = date('Y-m-d H:i:s');
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $campos = [];

        if (isset($datos['nombre'])) {
            $nombre = mysqli_real_escape_string($this->Connection, $datos['nombre']);
            $campos[] = "nombre = '$nombre'";
        }
        if (isset($datos['descripcion'])) {
            $descripcion = mysqli_real_escape_string($this->Connection, $datos['descripcion']);
            $campos[] = "descripcion = '$descripcion'";
        }
        if (isset($datos['color'])) {
            $color = mysqli_real_escape_string($this->Connection, $datos['color']);
            $campos[] = "color = '$color'";
        }
        if (isset($datos['icono'])) {
            $icono = mysqli_real_escape_string($this->Connection, $datos['icono']);
            $campos[] = "icono = '$icono'";
        }
        if (isset($datos['estatus'])) {
            $estatus = mysqli_real_escape_string($this->Connection, $datos['estatus']);
            $campos[] = "estatus = '$estatus'";
        }
        if (isset($datos['fechaInicio'])) {
            $campos[] = "fechaInicio = '" . $datos['fechaInicio'] . "'";
        }
        if (isset($datos['fechaFin'])) {
            $campos[] = "fechaFin = '" . $datos['fechaFin'] . "'";
        }

        $campos[] = "fechaModificacion = '$DATE'";
        $campos[] = "observacion = '[UPDATE $DATE] [idUser $idUser]'";

        $queryUpdate = "UPDATE jira_proyectos SET " . implode(', ', $campos) .
                       " WHERE idProyecto = " . intval($idProyecto) . ";";

        $this->open();
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Eliminar proyecto (soft delete)
    public function eliminar($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $DATE = date('Y-m-d H:i:s');
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        $queryUpdate = "UPDATE jira_proyectos SET
                        bstate = 0,
                        fechaModificacion = '$DATE',
                        observacion = '[DELETE $DATE] [idUser $idUser]'
                        WHERE idProyecto = " . intval($idProyecto) . ";";

        $this->open();
        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Obtener proyectos por usuario
    public function selectByUsuario($idUsuario) {
        $JSON_RESULT = [];
        $JSON_RESULT['proyectos'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = 'SELECT * FROM jira_proyectos_view WHERE idUsuario = ' . intval($idUsuario) . ' ORDER BY fechaCreacion DESC;';

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

    // Obtener usuarios para asignar proyectos
    public function getUsuarios() {
        $JSON_RESULT = [];
        $JSON_RESULT['usuarios'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = "SELECT idUsuario, CONCAT(nombre, ' ', apellidos) as nombre, email as correo, tipoUsuario
                        FROM usuarios WHERE bstate = 1 ORDER BY nombre ASC;";

        $this->open();

        // Verificar si la conexión se estableció
        if (!$this->Connection) {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error de conexión: " . mysqli_connect_error();
            return $JSON_RESULT;
        }

        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['usuarios'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error SQL: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // ASIGNACIÓN DE USUARIOS A PROYECTOS
    // ==========================================

    // Obtener usuarios asignados a un proyecto
    public function getUsuariosProyecto($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['usuarios'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = "SELECT * FROM jira_proyecto_usuarios_view
                        WHERE idProyecto = " . intval($idProyecto) . "
                        ORDER BY nombreUsuario ASC;";

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['usuarios'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Asignar usuario a proyecto
    public function asignarUsuario($idProyecto, $idUsuario) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        // Verificar si ya está asignado
        $this->open();
        $checkQuery = "SELECT id FROM jira_proyecto_usuarios
                       WHERE idProyecto = " . intval($idProyecto) . "
                       AND idUsuario = " . intval($idUsuario) . " AND bstate = 1;";
        $checkResult = mysqli_query($this->Connection, $checkQuery);

        if ($checkResult && $checkResult->num_rows > 0) {
            $JSON_RESULT['message'] = "YaAsignado";
            $this->closet();
            return $JSON_RESULT;
        }

        // Verificar si existe pero está eliminado
        $checkDeleted = "SELECT id FROM jira_proyecto_usuarios
                         WHERE idProyecto = " . intval($idProyecto) . "
                         AND idUsuario = " . intval($idUsuario) . " AND bstate = 0;";
        $deletedResult = mysqli_query($this->Connection, $checkDeleted);

        if ($deletedResult && $deletedResult->num_rows > 0) {
            // Reactivar
            $row = $deletedResult->fetch_array(MYSQLI_ASSOC);
            $queryUpdate = "UPDATE jira_proyecto_usuarios SET bstate = 1 WHERE id = " . $row['id'] . ";";
            mysqli_query($this->Connection, $queryUpdate);
            $JSON_RESULT['message'] = "Good";
        } else {
            // Insertar nuevo
            $queryInsert = "INSERT INTO jira_proyecto_usuarios (idProyecto, idUsuario, asignadoPor)
                            VALUES (" . intval($idProyecto) . ", " . intval($idUsuario) . ", $idUser);";

            if (mysqli_query($this->Connection, $queryInsert)) {
                $JSON_RESULT['id'] = mysqli_insert_id($this->Connection);
                $JSON_RESULT['message'] = "Good";
            } else {
                $JSON_RESULT['message'] = "Bad";
                $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
            }
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Desasignar usuario de proyecto
    public function desasignarUsuario($idProyecto, $idUsuario) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        // Verificar que no sea el creador del proyecto
        $this->open();
        $checkCreador = "SELECT idUsuarioCreador FROM jira_proyectos
                         WHERE idProyecto = " . intval($idProyecto) . " LIMIT 1;";
        $result = mysqli_query($this->Connection, $checkCreador);

        if ($result && $row = $result->fetch_array(MYSQLI_ASSOC)) {
            if (intval($row['idUsuarioCreador']) === intval($idUsuario)) {
                $JSON_RESULT['message'] = "NoPermitido";
                $JSON_RESULT['error'] = "No se puede desasignar al creador del proyecto";
                $this->closet();
                return $JSON_RESULT;
            }
        }

        $queryUpdate = "UPDATE jira_proyecto_usuarios SET bstate = 0
                        WHERE idProyecto = " . intval($idProyecto) . "
                        AND idUsuario = " . intval($idUsuario) . ";";

        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Obtener proyectos donde el usuario está asignado (incluye creados y asignados)
    public function selectByUsuarioAsignado($idUsuario) {
        $JSON_RESULT = [];
        $JSON_RESULT['proyectos'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = "SELECT DISTINCT p.*
                        FROM jira_proyectos_view p
                        INNER JOIN jira_proyecto_usuarios pu ON p.idProyecto = pu.idProyecto
                        WHERE pu.idUsuario = " . intval($idUsuario) . "
                        AND pu.bstate = 1
                        ORDER BY p.fechaCreacion DESC;";

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

    // Verificar si usuario tiene acceso al proyecto
    public function verificarAcceso($idProyecto, $idUsuario) {
        $JSON_RESULT = [];
        $JSON_RESULT['tieneAcceso'] = false;
        $JSON_RESULT['message'] = '';

        $querySelect = "SELECT id FROM jira_proyecto_usuarios
                        WHERE idProyecto = " . intval($idProyecto) . "
                        AND idUsuario = " . intval($idUsuario) . "
                        AND bstate = 1;";

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            if ($resultQuery->num_rows > 0) {
                $JSON_RESULT['tieneAcceso'] = true;
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // ==========================================
    // SISTEMA DE INVITACIONES
    // ==========================================

    // Crear invitación
    public function crearInvitacion($idProyecto, $email, $nombre) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        session_start();
        $idUser = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 0;

        // Verificar si el email ya está registrado
        $this->open();
        $checkEmail = "SELECT idUsuario FROM usuarios WHERE email = '" . mysqli_real_escape_string($this->Connection, $email) . "' AND bstate = 1;";
        $emailResult = mysqli_query($this->Connection, $checkEmail);

        if ($emailResult && $emailResult->num_rows > 0) {
            $JSON_RESULT['message'] = "EmailRegistrado";
            $JSON_RESULT['error'] = "Este correo ya está registrado en el sistema";
            $this->closet();
            return $JSON_RESULT;
        }

        // Verificar si ya hay una invitación pendiente
        $checkInvitacion = "SELECT idInvitacion FROM jira_invitaciones
                            WHERE idProyecto = " . intval($idProyecto) . "
                            AND email = '" . mysqli_real_escape_string($this->Connection, $email) . "'
                            AND estatus = 'PENDIENTE' AND bstate = 1;";
        $invResult = mysqli_query($this->Connection, $checkInvitacion);

        if ($invResult && $invResult->num_rows > 0) {
            $JSON_RESULT['message'] = "YaInvitado";
            $JSON_RESULT['error'] = "Ya existe una invitación pendiente para este correo";
            $this->closet();
            return $JSON_RESULT;
        }

        // Generar token único
        $token = bin2hex(random_bytes(32));
        $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+7 days'));
        $nombreEsc = mysqli_real_escape_string($this->Connection, $nombre);
        $emailEsc = mysqli_real_escape_string($this->Connection, $email);

        $queryInsert = "INSERT INTO jira_invitaciones
                        (idProyecto, email, nombre, token, idUsuarioInvitador, fechaExpiracion)
                        VALUES (" . intval($idProyecto) . ", '$emailEsc', '$nombreEsc', '$token', $idUser, '$fechaExpiracion');";

        if (mysqli_query($this->Connection, $queryInsert)) {
            $JSON_RESULT['idInvitacion'] = mysqli_insert_id($this->Connection);
            $JSON_RESULT['token'] = $token;
            $JSON_RESULT['message'] = "Good";

            // Enviar correo de invitación
            $this->enviarCorreoInvitacion($idProyecto, $email, $nombre, $token);
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Obtener invitaciones de un proyecto
    public function getInvitaciones($idProyecto) {
        $JSON_RESULT = [];
        $JSON_RESULT['invitaciones'] = [];
        $JSON_RESULT['message'] = '';

        $querySelect = "SELECT * FROM jira_invitaciones_view
                        WHERE idProyecto = " . intval($idProyecto) . "
                        ORDER BY fechaCreacion DESC;";

        $this->open();
        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                array_push($JSON_RESULT['invitaciones'], $row);
            }
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Cancelar invitación
    public function cancelarInvitacion($idInvitacion) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        $queryUpdate = "UPDATE jira_invitaciones SET estatus = 'CANCELADA' WHERE idInvitacion = " . intval($idInvitacion) . ";";

        if (mysqli_query($this->Connection, $queryUpdate)) {
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "Bad";
            $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Reenviar invitación
    public function reenviarInvitacion($idInvitacion) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();

        // Obtener datos de la invitación
        $query = "SELECT * FROM jira_invitaciones WHERE idInvitacion = " . intval($idInvitacion) . ";";
        $result = mysqli_query($this->Connection, $query);

        if ($result && $row = $result->fetch_array(MYSQLI_ASSOC)) {
            // Generar nuevo token y extender expiración
            $nuevoToken = bin2hex(random_bytes(32));
            $nuevaExpiracion = date('Y-m-d H:i:s', strtotime('+7 days'));

            $updateQuery = "UPDATE jira_invitaciones
                            SET token = '$nuevoToken', fechaExpiracion = '$nuevaExpiracion', estatus = 'PENDIENTE'
                            WHERE idInvitacion = " . intval($idInvitacion) . ";";

            if (mysqli_query($this->Connection, $updateQuery)) {
                $this->enviarCorreoInvitacion($row['idProyecto'], $row['email'], $row['nombre'], $nuevoToken);
                $JSON_RESULT['message'] = "Good";
            } else {
                $JSON_RESULT['message'] = "Bad";
                $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
            }
        } else {
            $JSON_RESULT['message'] = "NotFound";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Enviar correo de invitación
    private function enviarCorreoInvitacion($idProyecto, $email, $nombre, $token) {
        // Obtener nombre del proyecto
        $queryProyecto = "SELECT nombre FROM jira_proyectos WHERE idProyecto = " . intval($idProyecto) . ";";
        $result = mysqli_query($this->Connection, $queryProyecto);
        $nombreProyecto = 'Proyecto';
        if ($result && $row = $result->fetch_array(MYSQLI_ASSOC)) {
            $nombreProyecto = $row['nombre'];
        }

        $urlRegistro = "https://tu-dominio.com/registro?token=$token";

        $subject = "Invitación al proyecto: $nombreProyecto";
        $body = "
            <html>
            <body style='font-family: Arial, sans-serif; padding: 20px;'>
                <h2 style='color: #1976D2;'>¡Hola" . ($nombre ? " $nombre" : "") . "!</h2>
                <p>Has sido invitado a colaborar en el proyecto <strong>$nombreProyecto</strong>.</p>
                <p>Para aceptar la invitación y crear tu cuenta, haz clic en el siguiente enlace:</p>
                <p style='margin: 20px 0;'>
                    <a href='$urlRegistro'
                       style='background-color: #1976D2; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px; display: inline-block;'>
                        Aceptar Invitación
                    </a>
                </p>
                <p style='color: #666; font-size: 12px;'>
                    Este enlace expirará en 7 días. Si no solicitaste esta invitación, puedes ignorar este correo.
                </p>
            </body>
            </html>
        ";

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: noreply@tu-dominio.com\r\n";

        @mail($email, $subject, $body, $headers);
    }

    // Validar token de invitación
    public function validarInvitacion($token) {
        $JSON_RESULT = [];
        $JSON_RESULT['valida'] = false;
        $JSON_RESULT['invitacion'] = null;
        $JSON_RESULT['message'] = '';

        $this->open();
        $tokenEsc = mysqli_real_escape_string($this->Connection, $token);
        $query = "SELECT * FROM jira_invitaciones_view
                  WHERE token = '$tokenEsc' AND estatus = 'PENDIENTE' AND bstate = 1;";

        $result = mysqli_query($this->Connection, $query);

        if ($result && $row = $result->fetch_array(MYSQLI_ASSOC)) {
            // Verificar si no ha expirado
            if (strtotime($row['fechaExpiracion']) > time()) {
                $JSON_RESULT['valida'] = true;
                $JSON_RESULT['invitacion'] = $row;
                $JSON_RESULT['message'] = "Good";
            } else {
                // Marcar como expirada
                mysqli_query($this->Connection, "UPDATE jira_invitaciones SET estatus = 'EXPIRADA' WHERE token = '$tokenEsc';");
                $JSON_RESULT['message'] = "Expirada";
            }
        } else {
            $JSON_RESULT['message'] = "NotFound";
        }
        $this->closet();

        return $JSON_RESULT;
    }

    // Aceptar invitación (después de registrarse)
    public function aceptarInvitacion($token, $idUsuario) {
        $JSON_RESULT = [];
        $JSON_RESULT['message'] = '';

        $this->open();
        $tokenEsc = mysqli_real_escape_string($this->Connection, $token);
        $DATE = date('Y-m-d H:i:s');

        // Obtener datos de invitación
        $query = "SELECT * FROM jira_invitaciones WHERE token = '$tokenEsc' AND estatus = 'PENDIENTE' AND bstate = 1;";
        $result = mysqli_query($this->Connection, $query);

        if ($result && $row = $result->fetch_array(MYSQLI_ASSOC)) {
            // Marcar invitación como aceptada
            $updateInv = "UPDATE jira_invitaciones
                          SET estatus = 'ACEPTADA', idUsuarioRegistrado = " . intval($idUsuario) . ", fechaAceptacion = '$DATE'
                          WHERE idInvitacion = " . $row['idInvitacion'] . ";";
            mysqli_query($this->Connection, $updateInv);

            // Asignar usuario al proyecto
            $insertUsuario = "INSERT INTO jira_proyecto_usuarios (idProyecto, idUsuario, asignadoPor)
                              VALUES (" . $row['idProyecto'] . ", " . intval($idUsuario) . ", " . $row['idUsuarioInvitador'] . ");";
            mysqli_query($this->Connection, $insertUsuario);

            $JSON_RESULT['idProyecto'] = $row['idProyecto'];
            $JSON_RESULT['message'] = "Good";
        } else {
            $JSON_RESULT['message'] = "NotFound";
        }
        $this->closet();

        return $JSON_RESULT;
    }
}

?>
