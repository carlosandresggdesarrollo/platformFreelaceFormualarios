<?php

namespace    administrador\Modules\ModuleActualizarContrasena\Model\correo;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as Conection;
    /*<use>*/

    class correo extends Conection{

        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/

        /*<Verificar Email>*/
            public function verificarEmail($email){
                $JSON_RESULT = [];
                $JSON_RESULT['message'] = '';
                $JSON_RESULT['error'] = '';
                $email = trim($email);  // ⬅️ Quita espacios
                $QuerySelect = 'SELECT idUsuario, nombre, apellidos, email FROM usuarios WHERE email = "'.$email.'"';

                $this::open();
                if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                    if ($resultQuery->num_rows > 0) {
                        $r = $resultQuery->fetch_array(MYSQLI_ASSOC);
                        $JSON_RESULT['message'] = "Good";
                        $JSON_RESULT['existe'] = true;
                        $JSON_RESULT['usuario'] = $r;
                    } else {
                        $JSON_RESULT['message'] = "Good";
                        $JSON_RESULT['existe'] = false;
                    }
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }
                $this::closet();

                return $JSON_RESULT;
            }
        /*</Verificar Email>*/

        /*<Generar Token>*/
            public function generarToken($email, $idUsuario){
                $JSON_RESULT = [];
                $JSON_RESULT['message'] = '';

                // Generar token único
                $token = bin2hex(random_bytes(32));
                $expiracion = date('Y-m-d H:i:s', strtotime('+2 days'));

                // Primero eliminar tokens anteriores del usuario
                $QueryDelete = 'DELETE FROM password_reset_tokens WHERE idUsuario = '.$idUsuario;

                $this::open();
                mysqli_query($this->Connection, $QueryDelete);

                // Insertar nuevo token
                $QueryInsert = 'INSERT INTO password_reset_tokens (idUsuario, token, email, expiracion, usado)
                                VALUES ('.$idUsuario.', "'.$token.'", "'.$email.'", "'.$expiracion.'", 0)';

                if (mysqli_query($this->Connection, $QueryInsert)) {
                    $JSON_RESULT['message'] = "Good";
                    $JSON_RESULT['token'] = $token;
                    $JSON_RESULT['expiracion'] = $expiracion;
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }
                $this::closet();

                return $JSON_RESULT;
            }
        /*</Generar Token>*/

        /*<Obtener Config Servidor Correo>*/
            public function obtenerConfigCorreo(){
                $JSON_RESULT = [];

                $QuerySelect = 'SELECT * FROM servidorCorreo ORDER BY idSCorreo DESC LIMIT 1';

                $this::open();
                if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                    if ($resultQuery->num_rows > 0) {
                        $r = $resultQuery->fetch_array(MYSQLI_ASSOC);
                        $JSON_RESULT['message'] = "Good";
                        $JSON_RESULT['servidor'] = $r['servidor'];
                        $JSON_RESULT['usuario'] = $r['usuario'];
                        $JSON_RESULT['contrasena'] = $r['contrasena'];
                        $JSON_RESULT['puerto'] = $r['puerto'];
                    } else {
                        $JSON_RESULT['message'] = "Bad";
                        $JSON_RESULT['error'] = "No hay configuración de servidor de correo";
                    }
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }
                $this::closet();

                return $JSON_RESULT;
            }
        /*</Obtener Config Servidor Correo>*/

        /*<Enviar Correo>*/
            public function enviarCorreo($email, $nombre, $token, $configCorreo){
                $JSON_RESULT = [];

                // Incluir PHPMailer
                require_once(__DIR__ . '/../../ModuleRegistro/model/PHPMailerAutoload.php');

                $mail = new \PHPMailer;
                $mail->isSMTP();
                $mail->CharSet = 'UTF-8';

                    $mail->Host = $configCorreo['servidor'];
                    $mail->SMTPAuth = true;
                    $mail->Username = $configCorreo['usuario'];
                    $mail->Password = $configCorreo['contrasena'];
                    $mail->SMTPSecure = 'tls';
                    $mail->Port = $configCorreo['puerto'];

                    // URL de recuperación (ajusta según tu dominio)
                    // Para desarrollo local usa puerto 3039, para producción usa el dominio
                    $urlRecuperacion = 'http://sms.coeficiente.mx/recuperar-password/'.$token;
                    // $urlRecuperacion = 'https://tudominio.com/recuperar-password/'.$token;

                    $mail->setFrom($configCorreo['usuario'], 'SMS Coeficiente');
                    $mail->addAddress($email, $nombre);
                    $mail->isHTML(true);

                    $mail->Subject = 'Recuperación de Contraseña';
                    $mail->Body = '
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="text-align: center; padding: 20px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
                                <h1 style="color: white; margin: 0;">Recuperación de Contraseña</h1>
                            </div>
                            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                                <p style="color: #333; font-size: 16px;">Hola <strong>'.$nombre.'</strong>,</p>
                                <p style="color: #666; font-size: 14px;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="'.$urlRecuperacion.'" style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
                                </div>
                                <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo. El enlace expirará en 2 días.</p>
                                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="'.$urlRecuperacion.'" style="color: #667eea;">'.$urlRecuperacion.'</a></p>
                            </div>
                        </div>
                    ';

                if(!$mail->send()) {
                    $JSON_RESULT['message'] = 'Bad';
                    $JSON_RESULT['error'] = 'Error de correo: ' . $mail->ErrorInfo;
                } else {
                    $JSON_RESULT['message'] = 'Good';
                }

                return $JSON_RESULT;
            }
        /*</Enviar Correo>*/

        /*<Verificar Token>*/
           public function verificarToken($token){
                $JSON_RESULT = [];
                
                // DEBUG: Agregar info del token recibido
                $JSON_RESULT['debug'] = [
                    'token_recibido' => $token,
                    'token_length' => strlen($token)
                ];
                
                $this::open();
                
                // DEBUG: Ver qué hay en la BD para este token
                $debugQuery = 'SELECT token, usado, expiracion, 
                            TIMESTAMPDIFF(MINUTE, NOW(), expiracion) as minutos_restantes,
                            NOW() as ahora
                            FROM password_reset_tokens 
                            WHERE token = "'.mysqli_real_escape_string($this->Connection, $token).'"';
                
                $debugResult = mysqli_query($this->Connection, $debugQuery);
                if($debugResult && $debugResult->num_rows > 0){
                    $debug = $debugResult->fetch_array(MYSQLI_ASSOC);
                    //$JSON_RESULT['debug']['token_en_bd'] = true;
                    //$JSON_RESULT['debug']['usado'] = $debug['usado'];
                    //$JSON_RESULT['debug']['expiracion'] = $debug['expiracion'];
                    //$JSON_RESULT['debug']['ahora'] = $debug['ahora'];
                    //$JSON_RESULT['debug']['minutos_restantes'] = $debug['minutos_restantes'];
                } else {
                    $JSON_RESULT['debug']['token_en_bd'] = false;
                }
                
                // Tu consulta original
                $QuerySelect = 'SELECT prt.*, u.nombre, u.apellidos, u.email
                                FROM password_reset_tokens prt
                                INNER JOIN usuarios u ON u.idUsuario = prt.idUsuario
                                WHERE prt.token = "'.mysqli_real_escape_string($this->Connection, $token).'"
                                AND prt.usado = 0
                                AND prt.expiracion > NOW()';

                if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                    if ($resultQuery->num_rows > 0) {
                        $r = $resultQuery->fetch_array(MYSQLI_ASSOC);
                        $JSON_RESULT['message'] = "Good";
                        $JSON_RESULT['valido'] = true;
                        $JSON_RESULT['idUsuario'] = $r['idUsuario'];
                        $JSON_RESULT['nombre'] = $r['nombre'];
                        $JSON_RESULT['apellido'] = $r['apellidos'];
                        $JSON_RESULT['email'] = $r['email'];
                    } else {
                        $JSON_RESULT['message'] = "Good";
                        $JSON_RESULT['valido'] = false;
                        $JSON_RESULT['error'] = "El enlace ha expirado o ya fue utilizado";
                    }
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error: " . mysqli_error($this->Connection);
                }
                $this::closet();

                return $JSON_RESULT;
            }
        /*</Verificar Token>*/

        /*<Actualizar Contraseña>*/
            public function actualizarContrasena($token, $nuevaContrasena){
                $JSON_RESULT = [];

                // Primero verificar el token
                $verificacion = $this->verificarToken($token);

                if(!$verificacion['valido']){
                    return $verificacion;
                }

                $idUsuario = $verificacion['idUsuario'];
                $contrasenaHash = password_hash($nuevaContrasena, PASSWORD_BCRYPT);

                // Actualizar contraseña
                $QueryUpdate = 'UPDATE usuarios SET contrasena = "'.$contrasenaHash.'" WHERE idUsuario = '.$idUsuario;

                $this::open();
                if (mysqli_query($this->Connection, $QueryUpdate)) {
                    // Marcar token como usado
                    $QueryToken = 'UPDATE password_reset_tokens SET usado = 1 WHERE token = "'.$token.'"';
                    mysqli_query($this->Connection, $QueryToken);

                    $JSON_RESULT['message'] = "Good";
                    $JSON_RESULT['success'] = true;
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = "Error al actualizar: " . mysqli_error($this->Connection);
                }
                $this::closet();

                return $JSON_RESULT;
            }
        /*</Actualizar Contraseña>*/
    }
