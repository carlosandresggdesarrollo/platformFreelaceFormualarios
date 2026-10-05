<?php

namespace    administrador\Modules\ModuleActualizarContrasena\Model\correo;
    /*<Includes>*/
        include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');
        include_once(__DIR__ . '/../../ModulePugins/administrador.Correo.php');
    /*<Includes>*/
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as Conection;
        use  administrador\Modules\ModulePugins\Correo\Correo as Mailer;
    /*<use>*/

    /**
     * Recuperacion de contraseña por correo. En la base solo se guarda el hash SHA-256
     * del token, el enlace vence en 1 hora y sirve una sola vez.
     */
    class correo extends Conection{

        const VIGENCIA_MINUTOS = 60;

        public function __construct(){
            parent::__construct();
        }

        private function ejecutar($sql, $tipos, $params){
            $stmt = mysqli_prepare($this->Connection, $sql);
            if (!$stmt) {
                error_log('[Recuperar] ' . mysqli_error($this->Connection));
                return false;
            }
            mysqli_stmt_bind_param($stmt, $tipos, ...$params);
            if (!mysqli_stmt_execute($stmt)) {
                error_log('[Recuperar] ' . mysqli_stmt_error($stmt));
                return false;
            }
            return $stmt;
        }

        private function primeraFila($stmt){
            $res = $stmt ? mysqli_stmt_get_result($stmt) : null;
            return $res ? $res->fetch_assoc() : null;
        }

        /** Genera el token y envia el correo si el email pertenece a una cuenta activa. No revela si existe. */
        public function solicitarRecuperacion($email){
            $email = trim((string) $email);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return;
            }

            $this->open();
                $usuario = $this->primeraFila($this->ejecutar(
                    'SELECT idUsuario, nombre, apellidos, email FROM usuarios WHERE bstate = 1 AND email = ? LIMIT 1', 's', [$email]
                ));
                if (!$usuario) {
                    $this->closet();
                    return;
                }
                $idUsuario = intval($usuario['idUsuario']);
                $token = bin2hex(random_bytes(32));

                $this->ejecutar('DELETE FROM password_reset_tokens WHERE idUsuario = ?', 'i', [$idUsuario]);
                $ok = $this->ejecutar(
                    'INSERT INTO password_reset_tokens (idUsuario, token, email, expiracion, usado)
                     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ' . self::VIGENCIA_MINUTOS . ' MINUTE), 0)',
                    'iss', [$idUsuario, hash('sha256', $token), $usuario['email']]
                );
            $this->closet();

            if ($ok) {
                $this->enviarCorreo($usuario['email'], trim($usuario['nombre'] . ' ' . $usuario['apellidos']), $token);
            }
        }

        private function enviarCorreo($email, $nombre, $token){
            $url = Mailer::urlApp() . '/recuperar-password/' . $token;
            $nombreSeguro = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
            $html = '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Recuperación de Contraseña</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                        <p style="color: #333; font-size: 16px;">Hola <strong>' . $nombreSeguro . '</strong>,</p>
                        <p style="color: #666; font-size: 14px;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="' . $url . '" style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo. El enlace expirará en 1 hora.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="' . $url . '" style="color: #667eea;">' . $url . '</a></p>
                    </div>
                </div>';
            return (new Mailer())->enviar($email, $nombre, 'Recuperación de Contraseña', $html);
        }

        public function verificarToken($token){
            $JSON_RESULT = ['message' => 'Good', 'valido' => false];

            if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) {
                $JSON_RESULT['error'] = 'El enlace ha expirado o ya fue utilizado';
                return $JSON_RESULT;
            }

            $this->open();
                $fila = $this->primeraFila($this->ejecutar(
                    'SELECT prt.idUsuario, u.nombre, u.apellidos, u.email
                       FROM password_reset_tokens prt
                       INNER JOIN usuarios u ON u.idUsuario = prt.idUsuario AND u.bstate = 1
                      WHERE prt.token = ? AND prt.usado = 0 AND prt.expiracion > NOW()',
                    's', [hash('sha256', $token)]
                ));
            $this->closet();

            if ($fila) {
                $JSON_RESULT['valido'] = true;
                $JSON_RESULT['idUsuario'] = $fila['idUsuario'];
                $JSON_RESULT['nombre'] = $fila['nombre'];
                $JSON_RESULT['apellido'] = $fila['apellidos'];
                $JSON_RESULT['email'] = $fila['email'];
            } else {
                $JSON_RESULT['error'] = 'El enlace ha expirado o ya fue utilizado';
            }
            return $JSON_RESULT;
        }

        public function actualizarContrasena($token, $nuevaContrasena){
            $verificacion = $this->verificarToken($token);
            if (!$verificacion['valido']) {
                return $verificacion;
            }
            $idUsuario = intval($verificacion['idUsuario']);
            $JSON_RESULT = [];

            $this->open();
                $ok = $this->ejecutar(
                    'UPDATE usuarios SET contrasena = ?, requiereCambioPass = 0, fechaModificacion = NOW() WHERE idUsuario = ?',
                    'si', [password_hash((string) $nuevaContrasena, PASSWORD_BCRYPT), $idUsuario]
                );
                if ($ok) {
                    $this->ejecutar('UPDATE password_reset_tokens SET usado = 1 WHERE idUsuario = ?', 'i', [$idUsuario]);
                    // Las sesiones abiertas con la contraseña anterior dejan de poder renovarse.
                    $this->ejecutar(
                        'UPDATE refresh_tokens SET revocado = 1 WHERE id_sesion IN (SELECT id FROM sesiones WHERE id_usuario = ?)',
                        'i', [$idUsuario]
                    );
                    $JSON_RESULT['message'] = 'Good';
                    $JSON_RESULT['success'] = true;
                } else {
                    $JSON_RESULT['message'] = 'Bad';
                    $JSON_RESULT['error'] = 'No se pudo actualizar la contraseña';
                }
            $this->closet();
            return $JSON_RESULT;
        }
    }
