<?php

namespace administrador\Modules\ModulePugins\Subidas;

/**
 * Subida segura de imagenes: valida tamaño, extension y tipo real del archivo,
 * y guarda con un nombre aleatorio dentro de /uploads/<subcarpeta>/ (donde no se ejecuta PHP).
 */
class Subidas
{
    const EXTENSIONES = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'gif'  => 'image/gif',
    ];
    const TAMANO_MAXIMO = 5242880; // 5 MB

    /** @return array ['message' => 'Good'|'Bad', 'direccion' => string, 'error' => string] */
    public static function guardarImagen(?array $file, string $subcarpeta, string $prefijo): array
    {
        $respuesta = ['message' => 'Bad', 'direccion' => '', 'error' => ''];

        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            $respuesta['error'] = 'No se recibio el archivo';
            return $respuesta;
        }
        if ($file['size'] > self::TAMANO_MAXIMO) {
            $respuesta['error'] = 'La imagen excede 5 MB';
            return $respuesta;
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!isset(self::EXTENSIONES[$ext]) || self::EXTENSIONES[$ext] !== $mime) {
            $respuesta['error'] = 'Formato no permitido. Usa JPG, PNG, WEBP o GIF';
            return $respuesta;
        }

        $raiz = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '/var/www/html';
        $carpeta = $raiz . '/uploads/' . $subcarpeta . '/';
        if (!is_dir($carpeta) && !@mkdir($carpeta, 0775, true)) {
            $respuesta['error'] = 'No se pudo preparar la carpeta de destino';
            return $respuesta;
        }

        $nombre = $prefijo . '_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $carpeta . $nombre)) {
            $respuesta['error'] = 'No se pudo guardar el archivo';
            return $respuesta;
        }

        $respuesta['message'] = 'Good';
        $respuesta['direccion'] = '/uploads/' . $subcarpeta . '/' . $nombre;
        return $respuesta;
    }
}
