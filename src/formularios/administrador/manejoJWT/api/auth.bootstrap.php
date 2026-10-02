<?php
/**
 * Puente de autenticación para clientes con token (app móvil / cualquier cliente sin cookie).
 *
 * Se ejecuta vía `auto_prepend_file` ANTES de cada script de /administrador.
 * Si la petición trae `Authorization: Bearer <accessToken>` válido, abre la sesión PHP y
 * puebla las claves que usan los módulos legacy ($_SESSION["administrador-idUsuario"], etc.).
 *
 * Si NO hay token, no hace nada: la web sigue funcionando con su cookie de sesión normal.
 */

if (!defined('AUTH_BRIDGE_LOADED')) {
    define('AUTH_BRIDGE_LOADED', true);

    $__auth = '';
    if (function_exists('getallheaders')) {
        $__h = getallheaders();
        $__auth = $__h['Authorization'] ?? ($__h['authorization'] ?? '');
    }
    if ($__auth === '' && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $__auth = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (preg_match('/Bearer\s(\S+)/', $__auth, $__m)) {
        $__helper = __DIR__ . '/jwt.helper.php';
        if (file_exists($__helper)) {
            require_once $__helper;
            $__r = JWTHelper::validarToken($__m[1]);
            if (!empty($__r['valid']) && (($__r['type'] ?? '') === 'access')) {
                if (session_status() === PHP_SESSION_NONE) {
                    @session_start();
                }
                $__d = $__r['data'] ?? [];
                $_SESSION['administrador-idUsuario']   = $__d['idUsuario']   ?? null;
                $_SESSION['administrador-tipoUsuario'] = $__d['tipoUsuario'] ?? null;
                $_SESSION['administrador-idSesion']    = $__d['idSesion']    ?? null;
                $_SESSION['administrador-session']     = true;
            }
        }
    }
}
