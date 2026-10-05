<?php

    /*<Includes>*/
        include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');
        include_once(__DIR__ . '/../../ModulePugins/administrador.Correo.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as ConectionUsuario;
        use administrador\Modules\ModulePugins\Correo\Correo;
    /*<use>*/

    /**
     * Auto-registro publico. Siempre crea cuentas CLIENTE en estatus PENDIENTE
     * y envia el enlace de confirmacion de correo.
     */
    class usuario  extends ConectionUsuario{

        public function __construct(){
            parent::__construct();
        }

        private function ejecutar($sql, $tipos, $params){
            $stmt = mysqli_prepare($this->Connection, $sql);
            if (!$stmt) {
                error_log('[Registro] ' . mysqli_error($this->Connection));
                return false;
            }
            mysqli_stmt_bind_param($stmt, $tipos, ...$params);
            if (!mysqli_stmt_execute($stmt)) {
                error_log('[Registro] ' . mysqli_stmt_error($stmt));
                return false;
            }
            return $stmt;
        }

        private function registroActivo(){
            $r = mysqli_query($this->Connection, 'SELECT registroActivo FROM home_config WHERE idConfig = 1');
            $fila = $r ? $r->fetch_assoc() : null;
            return !$fila || intval($fila['registroActivo']) === 1;
        }

        public function crear($usuario, $contrasena, $nombre, $apellidos, $email, $IP, $tipo = 'CLIENTE', $profesion = ''){
            $JSON_RESULT = ['message' => '', 'error' => ''];

            $usuario   = trim((string) $usuario);
            $email     = trim((string) $email);
            $nombre    = trim((string) $nombre);
            $apellidos = trim((string) $apellidos);
            $contrasena = (string) $contrasena;

            if (!preg_match('/^[A-Za-z0-9._@-]{3,50}$/', $usuario)
                || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255
                || $nombre === '' || mb_strlen($nombre) > 100 || mb_strlen($apellidos) > 100
                || strlen($contrasena) < 8 || strlen($contrasena) > 100) {
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'Revisa los datos: usuario de 3 a 50 caracteres, correo valido y contraseña de al menos 8 caracteres';
                return $JSON_RESULT;
            }

            $this->open();

            if (!$this->registroActivo()) {
                $this->closet();
                $JSON_RESULT['message'] = 'Bad';
                $JSON_RESULT['error'] = 'El registro de nuevas cuentas esta desactivado';
                return $JSON_RESULT;
            }

            $stmt = $this->ejecutar(
                'SELECT COUNT(idUsuario) AS total FROM usuarios WHERE bstate = 1 AND (usuario = ? OR email = ?)',
                'ss', [$usuario, $email]
            );
            $res = $stmt ? mysqli_stmt_get_result($stmt) : null;
            $fila = $res ? $res->fetch_assoc() : null;
            if (!$fila || intval($fila['total']) > 0) {
                $this->closet();
                $JSON_RESULT['message'] = 'EMAIL REPETIDO';
                return $JSON_RESULT;
            }

            $token = bin2hex(random_bytes(32));
            $obs = ' [ INSERT Fecha: ' . date('Y-m-d H:i:s') . ' ], [ AUTO-REGISTRO IP: ' . $IP . ' ] ';
            $stmt = $this->ejecutar(
                'INSERT INTO usuarios (usuario, contrasena, nombre, apellidos, email, profesion, tipoUsuario, estatus, contraro,
                                       token, imagen, fechaCreacion, fechaModificacion, observacion, bstate)
                 VALUES (?, ?, ?, ?, ?, ?, "CLIENTE", "PENDIENTE", "0", ?, "/administrador/Modules/ModulesImage/cliente.png", NOW(), NOW(), ?, 1)',
                'ssssssss',
                [$usuario, password_hash($contrasena, PASSWORD_BCRYPT), $nombre, $apellidos, $email, mb_substr((string) $profesion, 0, 100), $token, $obs]
            );
            if (!$stmt) {
                $this->closet();
                $JSON_RESULT['message'] = 'ERROR DE SISTEMA';
                return $JSON_RESULT;
            }
            $idNuevo = mysqli_insert_id($this->Connection);
            $this->closet();

            if ($this->enviarEmail($email, $nombre, $token)) {
                $JSON_RESULT['message'] = 'Good';
            } else {
                // Sin correo de confirmacion la cuenta no sirve: se retira para que pueda reintentar.
                $this->open();
                $this->ejecutar('DELETE FROM usuarios WHERE idUsuario = ? AND estatus = "PENDIENTE" AND tipoUsuario = "CLIENTE"', 'i', [$idNuevo]);
                $this->closet();
                $JSON_RESULT['message'] = 'NO SE PUDO ENVIAR EMAIL';
            }
            return $JSON_RESULT;
        }

        private function enviarEmail($email, $nombre, $token){
            $enlace = Correo::urlApp() . '/confirmar-correo/' . $token;
            $html = '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">¡Bienvenido!</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333;">Gracias por registrarte en Formularios Web.</p>
                        <p style="font-size: 16px; color: #333;">Para confirmar tu correo electrónico, haz clic en el siguiente botón:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="' . $enlace . '" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Confirmar mi correo</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
                        <p style="font-size: 12px; color: #999; word-break: break-all;">' . $enlace . '</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">Si no solicitaste este registro, puedes ignorar este correo.</p>
                    </div>
                </div>';
            return (new Correo())->enviar($email, $nombre, 'Confirma tu correo - Formularios Web', $html);
        }
    }
