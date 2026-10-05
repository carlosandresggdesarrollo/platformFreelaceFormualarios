<?php
/**
 * Guardia de acceso de todo el backend. Se ejecuta via `auto_prepend_file` ANTES de cada script PHP.
 *
 * - Niega por defecto: solo corren los endpoints declarados en auth.policy.php.
 * - Acepta la cookie de sesion PHP (web) o `Authorization: Bearer <accessToken>` (app movil),
 *   y en ambos casos deja pobladas las claves $_SESSION["administrador-*"] que usan los modulos.
 */

if (!defined('AUTH_BRIDGE_LOADED') && PHP_SAPI !== 'cli') {
    define('AUTH_BRIDGE_LOADED', true);

    // Los errores van al log, nunca a la respuesta.
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');

    $__https = (($_SERVER['HTTPS'] ?? '') === 'on') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    if ($__https) {
        ini_set('session.cookie_secure', '1');
    }

    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');

    /** IP real del cliente: solo se confia en X-Forwarded-For cuando la peticion llega desde un proxy interno. */
    function authClientIp(): string
    {
        $remota = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $esInterna = filter_var($remota, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
        if ($esInterna && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $partes = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
            $candidata = end($partes);
            if (filter_var($candidata, FILTER_VALIDATE_IP)) {
                return $candidata;
            }
        }
        return $remota;
    }

    function authResponder(int $codigo, string $mensaje, string $error): void
    {
        http_response_code($codigo);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $mensaje, 'error' => $error]);
        exit;
    }

    /**
     * Limite de intentos por clave (ventana deslizante en archivos temporales).
     * Corta la peticion con 429 cuando se excede.
     */
    function authLimitarIntentos(string $clave, int $maximo, int $ventanaSegundos): void
    {
        $archivo = sys_get_temp_dir() . '/fw_rl_' . hash('sha256', $clave);
        $ahora = time();
        $fh = @fopen($archivo, 'c+');
        if (!$fh) {
            return;
        }
        flock($fh, LOCK_EX);
        $marcas = array_filter(
            array_map('intval', explode(',', (string) stream_get_contents($fh))),
            function ($t) use ($ahora, $ventanaSegundos) { return $t > $ahora - $ventanaSegundos; }
        );
        $excedido = count($marcas) >= $maximo;
        if (!$excedido) {
            $marcas[] = $ahora;
        }
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, implode(',', $marcas));
        flock($fh, LOCK_UN);
        fclose($fh);

        if ($excedido) {
            header('Retry-After: ' . $ventanaSegundos);
            authResponder(429, 'DEMASIADOS_INTENTOS', 'Demasiados intentos. Intenta de nuevo mas tarde.');
        }
    }

    (function () {
        $script = realpath($_SERVER['SCRIPT_FILENAME'] ?? '');
        $base = realpath(__DIR__ . '/../..');
        if ($script === false || $base === false) {
            authResponder(403, 'ACCESO_DENEGADO', 'Acceso denegado');
        }
        $script = str_replace('\\', '/', $script);
        $base = rtrim(str_replace('\\', '/', $base), '/') . '/';

        // Ningun PHP fuera de /administrador es parte de la aplicacion (p. ej. un archivo subido).
        if (strpos($script, $base) !== 0) {
            authResponder(403, 'ACCESO_DENEGADO', 'Acceso denegado');
        }
        $ruta = substr($script, strlen($base));
        $politica = require __DIR__ . '/auth.policy.php';

        $esPublico = in_array($ruta, $politica['publico'], true);

        $permitidos = null;
        foreach ($politica['roles'] as $patron => $roles) {
            if ($ruta === $patron || (substr($patron, -1) === '/' && strpos($ruta, $patron) === 0)) {
                $permitidos = $roles;
                break;
            }
        }
        if (!$esPublico && $permitidos === null) {
            authResponder(403, 'ACCESO_DENEGADO', 'Endpoint no habilitado');
        }

        // Token Bearer (app movil / clientes sin cookie).
        require_once __DIR__ . '/jwt.helper.php';
        $tokenValido = null;
        $token = JWTHelper::obtenerTokenDeHeader();
        if ($token !== null) {
            $r = JWTHelper::validarToken($token);
            if (!empty($r['valid']) && ($r['type'] ?? '') === 'access') {
                $tokenValido = $r['data'] ?? [];
            }
        }

        $traeCookie = isset($_COOKIE[session_name()]);
        if ($tokenValido !== null || $traeCookie || !$esPublico) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
        }
        if ($tokenValido !== null) {
            $_SESSION['administrador-idUsuario']   = $tokenValido['idUsuario'] ?? null;
            $_SESSION['administrador-tipoUsuario'] = $tokenValido['tipoUsuario'] ?? null;
            $_SESSION['administrador-idSesion']    = $tokenValido['idSesion'] ?? null;
        }

        $idUsuario = intval($_SESSION['administrador-idUsuario'] ?? 0);
        if ($idUsuario > 0) {
            $_SESSION['administrador-session'] = true;
        }

        if ($esPublico) {
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        if ($idUsuario <= 0) {
            authResponder(401, 'NO_AUTENTICADO', 'No autenticado');
        }
        $rol = strtoupper((string) ($_SESSION['administrador-tipoUsuario'] ?? ''));
        if ($permitidos !== '*' && !in_array($rol, $permitidos, true)) {
            authResponder(403, 'ACCESO_DENEGADO', 'No tienes permiso para esta accion');
        }
    })();
}
