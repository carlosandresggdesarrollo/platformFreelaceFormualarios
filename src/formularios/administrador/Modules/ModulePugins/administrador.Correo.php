<?php

namespace administrador\Modules\ModulePugins\Correo;

include_once(__DIR__ . '/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection;

/**
 * Envio de correos por SMTP. La configuracion sale de las variables SMTP_HOST / SMTP_PORT /
 * SMTP_USER / SMTP_PASS; si no estan definidas se usa la tabla servidorCorreo.
 * Las credenciales nunca salen de esta clase.
 */
class Correo extends Conection
{
    const REMITENTE = 'Formularios Web';

    /** URL publica del frontend, sin "/" final. */
    public static function urlApp(): string
    {
        return rtrim(getenv('APP_URL') ?: '', '/');
    }

    private function configuracion(): ?array
    {
        if (getenv('SMTP_HOST')) {
            return [
                'servidor'   => getenv('SMTP_HOST'),
                'puerto'     => intval(getenv('SMTP_PORT') ?: 587),
                'usuario'    => getenv('SMTP_USER') ?: '',
                'contrasena' => getenv('SMTP_PASS') ?: '',
            ];
        }
        $this->open();
        $r = mysqli_query($this->Connection, 'SELECT servidor, puerto, usuario, contrasena FROM servidorCorreo ORDER BY idSCorreo DESC LIMIT 1');
        $fila = $r ? $r->fetch_assoc() : null;
        $this->closet();
        return $fila ?: null;
    }

    public function enviar(string $para, string $nombre, string $asunto, string $html): bool
    {
        $config = $this->configuracion();
        if (!$config || self::urlApp() === '') {
            error_log('[Correo] Falta configurar SMTP o APP_URL');
            return false;
        }

        require_once(__DIR__ . '/../ModuleRegistro/model/PHPMailerAutoload.php');

        $mail = new \PHPMailer;
        $mail->isSMTP();
        $mail->CharSet = 'UTF-8';
        $mail->Host = $config['servidor'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['usuario'];
        $mail->Password = $config['contrasena'];
        $mail->SMTPSecure = 'tls';
        $mail->Port = intval($config['puerto']);
        $mail->setFrom($config['usuario'], self::REMITENTE);
        $mail->addAddress($para, $nombre);
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = $html;

        if (!$mail->send()) {
            error_log('[Correo] ' . $mail->ErrorInfo);
            return false;
        }
        return true;
    }
}
