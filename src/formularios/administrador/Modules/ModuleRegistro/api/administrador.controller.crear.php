<?php
header('Content-Type: application/json');

include_once(__DIR__ . '/../model/administrador.model.usuario.php');

try {
    $IP = authClientIp();
    authLimitarIntentos('registro|' . $IP, 10, 3600);

    $campo = function ($nombre) {
        return is_string($_POST[$nombre] ?? null) ? $_POST[$nombre] : '';
    };

    echo json_encode((new usuario())->crear(
        $campo('txt_usuario'),
        $campo('txt_contrasena'),
        $campo('txt_nombre'),
        $campo('txt_apellido'),
        $campo('txt_email'),
        $IP,
        'CLIENTE',
        $campo('txt_profesion')
    ));
} catch (\Throwable $e) {
    error_log('[Registro] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'ERROR DE SISTEMA']);
}
