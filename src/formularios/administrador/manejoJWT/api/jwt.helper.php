<?php

require_once __DIR__ . '/../JWT/JWT.php';
require_once __DIR__ . '/../JWT/Key.php';
require_once __DIR__ . '/../JWT/ExpiredException.php';
require_once __DIR__ . '/../JWT/BeforeValidException.php';
require_once __DIR__ . '/../JWT/SignatureInvalidException.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHelper {
    private static $algorithm = 'HS256';

    /** El secreto vive solo en la variable de entorno JWT_SECRET (minimo 32 caracteres). */
    private static function secretKey() {
        $secret = getenv('JWT_SECRET');
        if ($secret === false || strlen($secret) < 32) {
            throw new \RuntimeException('JWT_SECRET no esta configurado');
        }
        return $secret;
    }

    private static function issuer() {
        return getenv('APP_URL') ?: 'formularios-web';
    }

    public static function generarAccessToken($userData) {
        $issuedAt = time();
        $expire = $issuedAt + (15 * 60);

        $payload = [
            'iss' => self::issuer(),
            'iat' => $issuedAt,
            'exp' => $expire,
            'type' => 'access',
            'data' => [
                'idUsuario' => $userData['idUsuario'],
                'idSesion' => $userData['idSesion'],
                'tipoUsuario' => $userData['tipoUsuario'],
                'navegador' => $userData['navegador']
            ]
        ];

        return JWT::encode($payload, self::secretKey(), self::$algorithm);
    }

    public static function generarRefreshToken($userData) {
        $issuedAt = time();
        $expire = $issuedAt + (7 * 24 * 60 * 60);

        $payload = [
            'iss' => self::issuer(),
            'iat' => $issuedAt,
            'exp' => $expire,
            'type' => 'refresh',
            'data' => [
                'idUsuario' => $userData['idUsuario'],
                'idSesion' => $userData['idSesion'],
                'tokenId' => bin2hex(random_bytes(16))
            ]
        ];

        return JWT::encode($payload, self::secretKey(), self::$algorithm);
    }

    public static function validarToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(self::secretKey(), self::$algorithm));
            return [
                'valid' => true,
                'data' => (array) $decoded->data,
                'type' => $decoded->type,
                'exp' => $decoded->exp
            ];
        } catch (\Firebase\JWT\ExpiredException $e) {
            return ['valid' => false, 'error' => 'TOKEN_EXPIRED'];
        } catch (\Exception $e) {
            return ['valid' => false, 'error' => 'TOKEN_INVALID'];
        }
    }

    public static function obtenerTokenDeHeader() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($authHeader === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $nombre => $valor) {
                if (strcasecmp($nombre, 'Authorization') === 0) {
                    $authHeader = $valor;
                    break;
                }
            }
        }

        if (preg_match('/^Bearer\s+(\S+)$/', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
