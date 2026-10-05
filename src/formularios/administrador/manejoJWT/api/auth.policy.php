<?php
/**
 * Politica de acceso de /administrador. Todo endpoint que NO aparezca aqui responde 403.
 * Rutas relativas a la carpeta administrador/. Una entrada que termina en "/" cubre la carpeta.
 * Roles: lista de tipoUsuario permitidos, o '*' para cualquier usuario con sesion.
 */

$M = 'Modules/';
$ADMIN = ['ADMINISTRADOR'];
$ADMIN_AUDITOR = ['ADMINISTRADOR', 'AUDITOR'];

return [
    'publico' => [
        'manejoJWT/api/login.controller.php',
        'manejoJWT/api/refresh.controller.php',
        'manejoJWT/api/logout.controller.php',
        $M . 'ModuleHome/api/administrador.controller.publico.php',
        $M . 'ModuleAnalytics/api/administrador.controller.tracking.php',
        $M . 'ModuleFormularios/api/administrador.controller.formularios.publico.php',
        $M . 'ModuleCuestionarios/api/administrador.controller.cuestionarios.publico.php',
        $M . 'ModuleRegistro/api/administrador.controller.crear.php',
        $M . 'ModuleActualizarContrasena/api/administrador.controller.enviar.correo.php',
        $M . 'ModuleActualizarContrasena/api/administrador.controller.verificar.token.php',
        $M . 'ModuleActualizarContrasena/api/administrador.controller.actualizar.contrasena.php',
        $M . 'ConfirmacionCorreo/api/administrador.controller.confirmar.php',
    ],

    'roles' => [
        'manejoJWT/api/session.controller.php' => '*',

        $M . 'ModulePerfil/api/administrador.controller.cambiopass.php'  => '*',
        $M . 'ModulePerfil/api/administrador.controller.imagen.php'      => '*',
        $M . 'ModulePerfil/api/administrador.controller.password.php'    => '*',
        $M . 'ModulePerfil/api/administrador.controller.select.full.php' => '*',
        $M . 'ModulePerfil/api/administrador.controller.update.php'      => '*',

        $M . 'ModuloSolicitudDomicilio/api/' => '*',

        $M . 'ModuleFormularios/api/administrador.controller.formularios.php'        => ['ADMINISTRADOR', 'AUDITOR', 'CLIENTE'],
        $M . 'ModuleFormularios/api/administrador.controller.formularios.upload.php' => ['ADMINISTRADOR', 'CLIENTE'],
        $M . 'ModuleFormularios/api/administrador.controller.formularios.ia.php'     => ['ADMINISTRADOR', 'CLIENTE'],

        $M . 'ModuleClienteDashboard/api/administrador.controller.cliente.php'        => ['ADMINISTRADOR', 'AUDITOR', 'CLIENTE'],
        $M . 'ModuleClienteDashboard/api/administrador.controller.admin.clientes.php' => $ADMIN_AUDITOR,

        $M . 'ModuleAdminDashboard/api/admin.controller.stats.php' => $ADMIN_AUDITOR,

        $M . 'ModuleUsersUsers/api/' => $ADMIN,
        $M . 'ModuleAnalytics/api/administrador.controller.analytics.php' => $ADMIN,

        $M . 'ModuleHome/api/administrador.controller.audit.php'      => $ADMIN,
        $M . 'ModuleHome/api/administrador.controller.carruseles.php' => $ADMIN,
        $M . 'ModuleHome/api/administrador.controller.config.php'     => $ADMIN,
        $M . 'ModuleHome/api/administrador.controller.logo.php'       => $ADMIN,
        $M . 'ModuleHome/api/administrador.controller.modal.php'      => $ADMIN,
        $M . 'ModuleHome/api/administrador.controller.nav.php'        => $ADMIN,
        $M . 'ModuleHome/api/administrador.controller.redes.php'      => $ADMIN,

        $M . 'ModuleCuestionarios/api/administrador.controller.cuestionarios.php'       => $ADMIN,
        $M . 'ModuleCuestionarios/api/administrador.controller.cuestionarios.ia.php'    => $ADMIN,
        $M . 'ModuleCuestionarios/api/administrador.controller.cuestionarios.stats.php' => $ADMIN,
        $M . 'ModuleCuestionarios/api/administrador.controller.preguntas.php'           => $ADMIN,
    ],
];
