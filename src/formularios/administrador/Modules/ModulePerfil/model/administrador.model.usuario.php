<?php

namespace administrador\Modules\ModulePerfil\Model\usuario;
    /*<Includes>*/
        include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as ConectionUsuario;
    /*<use>*/

    /**
     * Perfil del usuario con sesion. El id SIEMPRE sale de la sesion: el que llegue en la
     * peticion se ignora, asi nadie puede leer o modificar el perfil de otra persona.
     */
    class usuario  extends ConectionUsuario{

        public function __construct(){
            parent::__construct();
        }

        private function idSesion(){
            return intval($_SESSION['administrador-idUsuario'] ?? 0);
        }

        private function ejecutar($sql, $tipos, $params){
            $stmt = mysqli_prepare($this->Connection, $sql);
            if (!$stmt) {
                error_log('[Perfil] ' . mysqli_error($this->Connection));
                return false;
            }
            mysqli_stmt_bind_param($stmt, $tipos, ...$params);
            if (!mysqli_stmt_execute($stmt)) {
                error_log('[Perfil] ' . mysqli_stmt_error($stmt));
                return false;
            }
            return $stmt;
        }

        private function primeraFila($stmt){
            $res = mysqli_stmt_get_result($stmt);
            return $res ? $res->fetch_assoc() : null;
        }

        public function selectFull($idUsuario = null){
            $JSON_RESULT = ['information' => [], 'message' => '', 'error' => ''];
            $this->open();
                $stmt = $this->ejecutar(
                    'SELECT idUsuario, usuario, nombre, apellidos, email, profesion, tipoUsuario, imagen, estatus
                       FROM usuarios WHERE bstate = 1 AND idUsuario = ?',
                    'i', [$this->idSesion()]
                );
                if ($stmt) {
                    $fila = $this->primeraFila($stmt);
                    $JSON_RESULT['information'] = $fila ? [$fila] : [];
                    $JSON_RESULT['message'] = 'Good';
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                }
            $this->closet();
            return $JSON_RESULT;
        }

        public function update($idUsuario, $nombre, $apellidos, $email, $imagen, $IP){
            $JSON_RESULT = ['message' => '', 'error' => '', 'email' => []];
            $id = $this->idSesion();
            $email = trim((string) $email);

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'Correo no valido';
                return $JSON_RESULT;
            }

            $this->open();
                $stmt = $this->ejecutar(
                    'SELECT COUNT(idUsuario) AS total FROM usuarios WHERE bstate = 1 AND email = ? AND idUsuario != ?',
                    'si', [$email, $id]
                );
                $repetido = !$stmt || intval($this->primeraFila($stmt)['total'] ?? 1) > 0;

                if ($repetido) {
                    $JSON_RESULT['message'] = 'EMAIL REPETIDO';
                } else {
                    $obs = ' [ UPDATE ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $id . ' IP: ' . $IP . '] ';
                    $sql = 'UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, fechaModificacion = NOW(), observacion = ?';
                    $tipos = 'ssss';
                    $params = [(string) $nombre, (string) $apellidos, $email, $obs];
                    if (is_string($imagen) && preg_match('#^/uploads/perfiles/[A-Za-z0-9._-]+$#', $imagen)) {
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

        public function updatePassword($idUsuario, $contrasenaActual, $contrasenaNueva, $IP){
            $JSON_RESULT = ['message' => '', 'error' => '', 'validated' => false];
            $id = $this->idSesion();
            $contrasenaNueva = (string) $contrasenaNueva;

            if (strlen($contrasenaNueva) < 8) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'La contraseña debe tener al menos 8 caracteres';
                return $JSON_RESULT;
            }

            $this->open();
                $stmt = $this->ejecutar('SELECT contrasena FROM usuarios WHERE bstate = 1 AND idUsuario = ? LIMIT 1', 'i', [$id]);
                $fila = $stmt ? $this->primeraFila($stmt) : null;

                if (!$fila) {
                    $JSON_RESULT['message'] = 'USUARIO NO ENCONTRADO';
                } elseif (!password_verify((string) $contrasenaActual, $fila['contrasena'])) {
                    $JSON_RESULT['message'] = 'CONTRASEÑA ACTUAL INCORRECTA';
                } else {
                    $JSON_RESULT['validated'] = true;
                    $obs = ' [ UPDATE PASSWORD ' . date('Y-m-d H:i:s') . ' ], [ idUser ' . $id . ' IP: ' . $IP . '] ';
                    $ok = $this->ejecutar(
                        'UPDATE usuarios SET contrasena = ?, requiereCambioPass = 0, fechaModificacion = NOW(), observacion = ? WHERE idUsuario = ?',
                        'ssi', [password_hash($contrasenaNueva, PASSWORD_BCRYPT), $obs, $id]
                    );
                    $JSON_RESULT['message'] = $ok ? 'Good' : 'Bad';
                }
            $this->closet();
            return $JSON_RESULT;
        }

        /** Cambio forzado tras el primer login: solo procede si el usuario tiene la marca pendiente. */
        public function cambiarPasswordObligatorio($contrasenaNueva){
            $this->open();
                $stmt = $this->ejecutar(
                    'UPDATE usuarios SET contrasena = ?, requiereCambioPass = 0, fechaModificacion = NOW()
                      WHERE idUsuario = ? AND bstate = 1 AND requiereCambioPass = 1',
                    'si', [password_hash((string) $contrasenaNueva, PASSWORD_BCRYPT), $this->idSesion()]
                );
                $ok = $stmt && mysqli_stmt_affected_rows($stmt) === 1;
            $this->closet();
            return $ok;
        }
    }
