<?php

namespace  administrador\Modules\ModuleUsersUsers\Model\Usuarios;
    /*<Includes>*/
        include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as ConectionUsuarios;
    /*<use>*/

    /**
     * Gestion de usuarios (solo ADMINISTRADOR; el rol lo valida auth.bootstrap.php).
     * Todas las consultas usan sentencias preparadas y nunca se devuelve la contraseña ni el SQL.
     */
    class Usuarios extends ConectionUsuarios{

        const COLUMNAS = 'idUsuario, usuario, nombre, apellidos, email, profesion, tipoUsuario, imagen, estatus, fechaCreacion, fechaModificacion';
        const TIPOS_VALIDOS = ['ADMINISTRADOR', 'AUDITOR', 'CLIENTE'];
        const ESTATUS_VALIDOS = ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'CONFIRMADA'];
        const ORDEN_VALIDO = ['fechaCreacion', 'nombre', 'apellidos', 'email', 'tipoUsuario', 'estatus'];
        const IMAGEN_DEFECTO = '/administrador/Modules/ModulesImage/usuarios.png';

        public function __construct(){
            parent::__construct();
        }

        private function idSesion(){
            return intval($_SESSION['administrador-idUsuario'] ?? 0);
        }

        /** Ejecuta una sentencia preparada. Devuelve el statement o false (el detalle va al log). */
        private function ejecutar($sql, $tipos = '', $params = []){
            $stmt = mysqli_prepare($this->Connection, $sql);
            if (!$stmt) {
                error_log('[Usuarios] ' . mysqli_error($this->Connection));
                return false;
            }
            if ($tipos !== '') {
                mysqli_stmt_bind_param($stmt, $tipos, ...$params);
            }
            if (!mysqli_stmt_execute($stmt)) {
                error_log('[Usuarios] ' . mysqli_stmt_error($stmt));
                return false;
            }
            return $stmt;
        }

        private function filas($stmt){
            $filas = [];
            $res = mysqli_stmt_get_result($stmt);
            while ($res && ($fila = $res->fetch_assoc())) {
                $filas[] = $fila;
            }
            return $filas;
        }

        private function existe($campo, $valor, $excluirId){
            $stmt = $this->ejecutar(
                "SELECT COUNT(*) AS total FROM usuarios WHERE bstate = 1 AND $campo = ? AND idUsuario != ?",
                'si', [$valor, $excluirId]
            );
            if (!$stmt) return true;
            $fila = $this->filas($stmt);
            return intval($fila[0]['total'] ?? 0) > 0;
        }

        private function rutaImagenValida($imagen){
            return is_string($imagen)
                && preg_match('#^/(uploads/perfiles|administrador/Modules/ModulesImage)/[A-Za-z0-9._ -]+$#', $imagen);
        }

        public function selectFull($Busqueda, $hoja, $Ordenamiento, $ASC_DESC){
            $JSON_RESULT = [
                'information'   => [],
                'message'       => '',
                'error'         => '',
                'totalRegistro' => 0,
                'cantidadHojas' => 1,
                'inicioActual'  => max(0, intval($hoja)) * 20,
            ];

            $where  = 'tipoUsuario IN ("ADMINISTRADOR","AUDITOR") AND bstate = 1';
            $tipos  = '';
            $params = [];
            $Busqueda = trim((string) $Busqueda);
            if ($Busqueda !== '') {
                $like = '%' . addcslashes($Busqueda, '%_\\') . '%';
                $where .= ' AND (nombre LIKE ? OR apellidos LIKE ? OR email LIKE ? OR estatus LIKE ? OR tipoUsuario LIKE ?)';
                $tipos  = 'sssss';
                $params = [$like, $like, $like, $like, $like];
            }

            $orden = '';
            if (in_array($Ordenamiento, self::ORDEN_VALIDO, true)) {
                $orden = ' ORDER BY ' . $Ordenamiento . (strtoupper((string) $ASC_DESC) === 'DESC' ? ' DESC' : ' ASC');
            }

            $this->open();
                $stmt = $this->ejecutar("SELECT COUNT(idUsuario) AS total FROM usuarios WHERE $where", $tipos, $params);
                if ($stmt) {
                    $total = $this->filas($stmt);
                    $JSON_RESULT['totalRegistro'] = intval($total[0]['total'] ?? 0);
                    $JSON_RESULT['cantidadHojas'] = max(1, $JSON_RESULT['totalRegistro'] / 20);
                }

                $stmt = $this->ejecutar(
                    'SELECT ' . self::COLUMNAS . " FROM usuarios WHERE $where$orden LIMIT 20 OFFSET " . $JSON_RESULT['inicioActual'],
                    $tipos, $params
                );
                if ($stmt) {
                    $JSON_RESULT['information'] = $this->filas($stmt);
                    $JSON_RESULT['message'] = 'Good';
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                }
            $this->closet();
            return $JSON_RESULT;
        }

        public function selectOne($id){
            $JSON_RESULT = ['information' => [], 'message' => '', 'error' => ''];
            $this->open();
                $stmt = $this->ejecutar('SELECT ' . self::COLUMNAS . ' FROM usuarios WHERE bstate = 1 AND idUsuario = ?', 'i', [intval($id)]);
                if ($stmt) {
                    $JSON_RESULT['information'] = $this->filas($stmt);
                    $JSON_RESULT['message'] = 'Good';
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                }
            $this->closet();
            return $JSON_RESULT;
        }

        public function deleteImagen($id){
            $JSON_RESULT = ['information' => self::IMAGEN_DEFECTO, 'message' => '', 'error' => ''];
            $obs = ' [ DELETE IMAGEN ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $this->idSesion() . ' ] ';
            $this->open();
                $stmt = $this->ejecutar(
                    'UPDATE usuarios SET imagen = ?, fechaModificacion = NOW(), observacion = ? WHERE idUsuario = ?',
                    'ssi', [self::IMAGEN_DEFECTO, $obs, intval($id)]
                );
                $JSON_RESULT['message'] = $stmt ? 'Good' : 'Bad';
            $this->closet();
            return $JSON_RESULT;
        }

        public function deleteUsuario($id, $IP){
            $JSON_RESULT = ['message' => '', 'error' => ''];
            $id = intval($id);
            if ($id <= 0 || $id === $this->idSesion()) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'No puedes eliminar tu propio usuario';
                return $JSON_RESULT;
            }
            $obs = ' [ DELETE ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $this->idSesion() . ' IP ' . $IP . '] ';
            $this->open();
                $stmt = $this->ejecutar(
                    'UPDATE usuarios SET bstate = 0, fechaModificacion = NOW(), observacion = ? WHERE idUsuario = ?',
                    'si', [$obs, $id]
                );
                $JSON_RESULT['message'] = $stmt ? 'Good' : 'Bad';
            $this->closet();
            return $JSON_RESULT;
        }

        public function updateUsuario($id, $usuario, $nombre, $apellido, $email, $tipo, $imagen, $IP, $profesion = ''){
            $JSON_RESULT = ['message' => '', 'error' => ''];
            $id = intval($id);
            $usuario = trim((string) $usuario);
            $email = trim((string) $email);

            if ($id <= 0 || $usuario === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($tipo, self::TIPOS_VALIDOS, true)) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'Datos no validos';
                return $JSON_RESULT;
            }
            // Un administrador no puede quitarse a si mismo el rol.
            if ($id === $this->idSesion() && $tipo !== 'ADMINISTRADOR') {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'No puedes cambiar tu propio rol';
                return $JSON_RESULT;
            }

            $this->open();
                if ($this->existe('usuario', $usuario, $id)) {
                    $JSON_RESULT['message'] = 'USUARIO REPETIDO';
                } elseif ($this->existe('email', $email, $id)) {
                    $JSON_RESULT['message'] = 'CORREO REPETIDO';
                } else {
                    $obs = ' [ UPDATE ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $this->idSesion() . ' IP: ' . $IP . '] ';
                    $sql = 'UPDATE usuarios SET usuario = ?, nombre = ?, apellidos = ?, email = ?, profesion = ?, tipoUsuario = ?,
                                   fechaModificacion = NOW(), observacion = ?';
                    $tipos = 'sssssss';
                    $params = [$usuario, (string) $nombre, (string) $apellido, $email, (string) $profesion, $tipo, $obs];
                    if ($this->rutaImagenValida($imagen)) {
                        $sql .= ', imagen = ?';
                        $tipos .= 's';
                        $params[] = $imagen;
                    }
                    $sql .= ' WHERE idUsuario = ?';
                    $tipos .= 'i';
                    $params[] = $id;
                    $JSON_RESULT['message'] = $this->ejecutar($sql, $tipos, $params) ? 'Good' : 'Bad';
                }
            $this->closet();
            return $JSON_RESULT;
        }

        public function crearUsuario($usuario, $nombre, $apellido, $contrasena, $email, $tipo, $imagen, $ip, $profesion = ''){
            $JSON_RESULT = ['idUsuario' => 0, 'message' => '', 'error' => ''];
            $usuario = trim((string) $usuario);
            $email = trim((string) $email);
            $contrasena = (string) $contrasena;

            if ($usuario === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($tipo, self::TIPOS_VALIDOS, true) || strlen($contrasena) < 8) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'Datos no validos';
                return $JSON_RESULT;
            }
            if (!$this->rutaImagenValida($imagen)) {
                $imagen = self::IMAGEN_DEFECTO;
            }

            $this->open();
                if ($this->existe('usuario', $usuario, 0)) {
                    $JSON_RESULT['message'] = 'USUARIO REPETIDO';
                } elseif ($this->existe('email', $email, 0)) {
                    $JSON_RESULT['message'] = 'CORREO REPETIDO';
                } else {
                    $hash = password_hash($contrasena, PASSWORD_BCRYPT);
                    $obs = ' [ INSERT ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $this->idSesion() . ' IP ' . $ip . ' ] ';
                    $stmt = $this->ejecutar(
                        'INSERT INTO usuarios (usuario, nombre, apellidos, contrasena, email, profesion, tipoUsuario, imagen,
                                               estatus, contraro, token, fechaCreacion, fechaModificacion, observacion, bstate)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, "ACTIVO", "", "", NOW(), NOW(), ?, 1)',
                        'sssssssss',
                        [$usuario, (string) $nombre, (string) $apellido, $hash, $email, (string) $profesion, $tipo, $imagen, $obs]
                    );
                    if ($stmt) {
                        $JSON_RESULT['idUsuario'] = mysqli_insert_id($this->Connection);
                        $JSON_RESULT['message'] = 'Good';
                    } else {
                        $JSON_RESULT['message'] = 'Bad';
                    }
                }
            $this->closet();
            return $JSON_RESULT;
        }

        public function updateEstatus($estatus, $idUsuario, $IP){
            $JSON_RESULT = ['message' => '', 'error' => ''];
            $idUsuario = intval($idUsuario);
            $estatus = strtoupper(trim((string) $estatus));
            if ($idUsuario <= 0 || !in_array($estatus, self::ESTATUS_VALIDOS, true) || $idUsuario === $this->idSesion()) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'Datos no validos';
                return $JSON_RESULT;
            }
            $obs = ' [ UPDATE ESTATUS ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $this->idSesion() . ' IP ' . $IP . ' ] ';
            $this->open();
                $stmt = $this->ejecutar(
                    'UPDATE usuarios SET estatus = ?, fechaModificacion = NOW(), observacion = ? WHERE idUsuario = ?',
                    'ssi', [$estatus, $obs, $idUsuario]
                );
                $JSON_RESULT['message'] = $stmt ? 'Good' : 'Bad';
            $this->closet();
            return $JSON_RESULT;
        }

        public function updatePassword($idUsuario, $contrasenaNueva, $IP){
            $JSON_RESULT = ['message' => '', 'error' => ''];
            $idUsuario = intval($idUsuario);
            $contrasenaNueva = (string) $contrasenaNueva;
            if ($idUsuario <= 0 || strlen($contrasenaNueva) < 8) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'La contraseña debe tener al menos 8 caracteres';
                return $JSON_RESULT;
            }
            $hash = password_hash($contrasenaNueva, PASSWORD_BCRYPT);
            $obs = ' [ UPDATE PASSWORD BY ADMIN ' . date('Y-m-d H:i:s') . ' ], [ Admin ' . $this->idSesion() . ' IP: ' . $IP . '] ';
            $this->open();
                $stmt = $this->ejecutar(
                    'UPDATE usuarios SET contrasena = ?, fechaModificacion = NOW(), observacion = ? WHERE idUsuario = ?',
                    'ssi', [$hash, $obs, $idUsuario]
                );
                $JSON_RESULT['message'] = $stmt ? 'Good' : 'Bad';
            $this->closet();
            return $JSON_RESULT;
        }
    }
