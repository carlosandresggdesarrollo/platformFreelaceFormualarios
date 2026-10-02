-- ========================================
-- MIGRACIÓN: Sistema de múltiples usuarios por proyecto
-- e invitaciones por correo
-- Base de datos: administrador
-- ========================================

-- ----------------------------------------
-- 1. TABLA: jira_proyecto_usuarios
-- Relación muchos a muchos entre proyectos y usuarios
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `jira_proyecto_usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idProyecto` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaAsignacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `asignadoPor` int(11) DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_proyecto_usuario` (`idProyecto`, `idUsuario`),
  KEY `idx_proyecto` (`idProyecto`),
  KEY `idx_usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------
-- 2. TABLA: jira_invitaciones
-- Sistema de invitaciones por correo
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `jira_invitaciones` (
  `idInvitacion` int(11) NOT NULL AUTO_INCREMENT,
  `idProyecto` int(11) NOT NULL,
  `email` varchar(200) NOT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `token` varchar(100) NOT NULL,
  `estatus` enum('PENDIENTE','ACEPTADA','EXPIRADA','CANCELADA') DEFAULT 'PENDIENTE',
  `idUsuarioInvitador` int(11) NOT NULL,
  `idUsuarioRegistrado` int(11) DEFAULT NULL COMMENT 'ID del usuario cuando acepta la invitación',
  `fechaExpiracion` datetime NOT NULL,
  `fechaAceptacion` datetime DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idInvitacion`),
  UNIQUE KEY `uk_token` (`token`),
  KEY `idx_proyecto` (`idProyecto`),
  KEY `idx_email` (`email`),
  KEY `idx_estatus` (`estatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------
-- 3. AGREGAR COLUMNA idUsuarioCreador a jira_proyectos
-- Para identificar quién creó el proyecto
-- ----------------------------------------
ALTER TABLE jira_proyectos
ADD COLUMN IF NOT EXISTS `idUsuarioCreador` int(11) DEFAULT NULL AFTER `idUsuario`;

-- Migrar datos existentes: el idUsuario actual será el creador
UPDATE jira_proyectos SET idUsuarioCreador = idUsuario WHERE idUsuarioCreador IS NULL;

-- ----------------------------------------
-- 4. VISTA: jira_proyectos_view
-- ----------------------------------------
DROP VIEW IF EXISTS `jira_proyectos_view`;

CREATE VIEW `jira_proyectos_view` AS
SELECT
  p.idProyecto,
  p.folio,
  p.nombre,
  p.descripcion,
  p.color,
  p.icono,
  p.idUsuario,
  p.idUsuarioCreador,
  p.estatus,
  p.fechaInicio,
  p.fechaFin,
  p.fechaCreacion,
  p.fechaModificacion,
  p.observacion,
  p.bstate,
  IFNULL(u.nombre, '') AS nombreUsuario,
  IFNULL(u.apellidos, '') AS apellidosUsuario,
  IFNULL(u.email, '') AS emailUsuario,
  IFNULL(uc.nombre, '') AS nombreCreador,
  IFNULL(uc.apellidos, '') AS apellidosCreador,
  (SELECT COUNT(*) FROM jira_tareas t WHERE t.idProyecto = p.idProyecto AND t.bstate = 1) AS totalTareas,
  (SELECT COUNT(*) FROM jira_fases f WHERE f.idProyecto = p.idProyecto AND f.bstate = 1) AS totalFases,
  (SELECT COUNT(*) FROM jira_proyecto_usuarios pu WHERE pu.idProyecto = p.idProyecto AND pu.bstate = 1) AS totalUsuarios
FROM jira_proyectos p
LEFT JOIN usuarios u ON p.idUsuario = u.idUsuario
LEFT JOIN usuarios uc ON p.idUsuarioCreador = uc.idUsuario
WHERE p.bstate = 1;

-- ----------------------------------------
-- 5. VISTA: jira_proyecto_usuarios_view
-- ----------------------------------------
DROP VIEW IF EXISTS `jira_proyecto_usuarios_view`;

CREATE VIEW `jira_proyecto_usuarios_view` AS
SELECT
  pu.id,
  pu.idProyecto,
  pu.idUsuario,
  pu.fechaAsignacion,
  pu.asignadoPor,
  pu.bstate,
  p.nombre AS nombreProyecto,
  p.color AS colorProyecto,
  IFNULL(u.nombre, '') AS nombreUsuario,
  IFNULL(u.apellidos, '') AS apellidosUsuario,
  IFNULL(u.email, '') AS emailUsuario,
  IFNULL(u.tipoUsuario, '') AS tipoUsuario,
  IFNULL(ap.nombre, '') AS nombreAsignador,
  IFNULL(ap.apellidos, '') AS apellidosAsignador
FROM jira_proyecto_usuarios pu
INNER JOIN jira_proyectos p ON pu.idProyecto = p.idProyecto
LEFT JOIN usuarios u ON pu.idUsuario = u.idUsuario
LEFT JOIN usuarios ap ON pu.asignadoPor = ap.idUsuario
WHERE pu.bstate = 1;

-- ----------------------------------------
-- 6. VISTA: jira_invitaciones_view
-- ----------------------------------------
DROP VIEW IF EXISTS `jira_invitaciones_view`;

CREATE VIEW `jira_invitaciones_view` AS
SELECT
  i.idInvitacion,
  i.idProyecto,
  i.email,
  i.nombre,
  i.token,
  i.estatus,
  i.idUsuarioInvitador,
  i.idUsuarioRegistrado,
  i.fechaExpiracion,
  i.fechaAceptacion,
  i.fechaCreacion,
  i.bstate,
  p.nombre AS nombreProyecto,
  p.color AS colorProyecto,
  IFNULL(ui.nombre, '') AS nombreInvitador,
  IFNULL(ui.apellidos, '') AS apellidosInvitador
FROM jira_invitaciones i
INNER JOIN jira_proyectos p ON i.idProyecto = p.idProyecto
LEFT JOIN usuarios ui ON i.idUsuarioInvitador = ui.idUsuario
WHERE i.bstate = 1;

-- ----------------------------------------
-- 7. ACTUALIZAR VISTA: jira_tareas_view
-- Agregar información de permisos
-- ----------------------------------------
DROP VIEW IF EXISTS `jira_tareas_view`;

CREATE VIEW `jira_tareas_view` AS
SELECT
  t.idTarea, t.folio, t.idProyecto, t.idFase, t.titulo, t.descripcion,
  t.prioridad, t.fechaInicio, t.fechaVencimiento, t.orden,
  t.idUsuarioAsignado, t.idUsuarioCreador, t.fechaCreacion, t.fechaModificacion, t.bstate,
  p.nombre AS nombreProyecto, p.color AS colorProyecto, p.idUsuarioCreador AS idCreadorProyecto,
  f.nombre AS nombreFase, f.color AS colorFase, f.orden AS ordenFase,
  IFNULL(ua.nombre, '') AS nombreAsignado, IFNULL(ua.apellidos, '') AS apellidosAsignado,
  IFNULL(uc.nombre, '') AS nombreCreador, IFNULL(uc.apellidos, '') AS apellidosCreador,
  (SELECT COUNT(*) FROM jira_comentarios c WHERE c.idTarea = t.idTarea AND c.bstate = 1) AS totalComentarios,
  (SELECT COUNT(*) FROM jira_archivos a WHERE a.idTarea = t.idTarea AND a.bstate = 1) AS totalArchivos
FROM jira_tareas t
LEFT JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
LEFT JOIN jira_fases f ON t.idFase = f.idFase
LEFT JOIN usuarios ua ON t.idUsuarioAsignado = ua.idUsuario
LEFT JOIN usuarios uc ON t.idUsuarioCreador = uc.idUsuario
WHERE t.bstate = 1;

-- ----------------------------------------
-- 8. TRIGGER: Auto-asignar creador al proyecto
-- Cuando se crea un proyecto, automáticamente asignar al creador
-- ----------------------------------------
DROP TRIGGER IF EXISTS `tr_proyecto_auto_asignar_creador`;

DELIMITER //
CREATE TRIGGER `tr_proyecto_auto_asignar_creador`
AFTER INSERT ON `jira_proyectos`
FOR EACH ROW
BEGIN
  INSERT INTO jira_proyecto_usuarios (idProyecto, idUsuario, asignadoPor)
  VALUES (NEW.idProyecto, COALESCE(NEW.idUsuarioCreador, NEW.idUsuario), NEW.idUsuarioCreador);
END//
DELIMITER ;

-- ========================================
-- FIN DE MIGRACIÓN
-- ========================================
