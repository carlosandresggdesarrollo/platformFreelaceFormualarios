-- ========================================
-- MIGRACIONES DE BASE DE DATOS
-- Ejecutar para actualizar la base de datos existente
-- Base de datos: administrador
-- ========================================

-- ----------------------------------------
-- ACTUALIZAR TABLA jira_proyectos
-- ----------------------------------------
ALTER TABLE jira_proyectos
ADD COLUMN IF NOT EXISTS `folio` int(11) NOT NULL DEFAULT 1 AFTER `idProyecto`,
ADD COLUMN IF NOT EXISTS `icono` varchar(100) DEFAULT 'solar:folder-bold' AFTER `color`,
ADD COLUMN IF NOT EXISTS `estatus` varchar(50) DEFAULT 'ACTIVO' AFTER `idUsuario`,
ADD COLUMN IF NOT EXISTS `fechaInicio` date DEFAULT NULL AFTER `estatus`,
ADD COLUMN IF NOT EXISTS `fechaFin` date DEFAULT NULL AFTER `fechaInicio`;

-- Agregar indice si no existe
ALTER TABLE jira_proyectos ADD INDEX IF NOT EXISTS `idx_folio` (`folio`);

-- ----------------------------------------
-- CREAR TABLAS JIRA SI NO EXISTEN
-- ----------------------------------------

-- Tabla jira_fases
CREATE TABLE IF NOT EXISTS `jira_fases` (
  `idFase` int(11) NOT NULL AUTO_INCREMENT,
  `idProyecto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT '#1976D2',
  `orden` int(11) DEFAULT 1,
  `esInicial` tinyint(1) DEFAULT 0,
  `esFinal` tinyint(1) DEFAULT 0,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idFase`),
  KEY `idx_proyecto` (`idProyecto`),
  KEY `idx_orden` (`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla jira_tareas
CREATE TABLE IF NOT EXISTS `jira_tareas` (
  `idTarea` int(11) NOT NULL AUTO_INCREMENT,
  `folio` int(11) NOT NULL,
  `idProyecto` int(11) NOT NULL,
  `idFase` int(11) NOT NULL,
  `titulo` varchar(300) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','URGENTE') DEFAULT 'MEDIA',
  `fechaInicio` date DEFAULT NULL,
  `fechaVencimiento` date DEFAULT NULL,
  `orden` int(11) DEFAULT 1,
  `idUsuarioAsignado` int(11) DEFAULT NULL,
  `idUsuarioCreador` int(11) DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `observacion` text DEFAULT NULL,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idTarea`),
  KEY `idx_proyecto` (`idProyecto`),
  KEY `idx_fase` (`idFase`),
  KEY `idx_usuario_asignado` (`idUsuarioAsignado`),
  KEY `idx_bstate` (`bstate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla jira_comentarios
CREATE TABLE IF NOT EXISTS `jira_comentarios` (
  `idComentario` int(11) NOT NULL AUTO_INCREMENT,
  `idTarea` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `tipo` enum('COMENTARIO','CAMBIO_FASE','ARCHIVO','SISTEMA') DEFAULT 'COMENTARIO',
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idComentario`),
  KEY `idx_tarea` (`idTarea`),
  KEY `idx_usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla jira_archivos
CREATE TABLE IF NOT EXISTS `jira_archivos` (
  `idArchivo` int(11) NOT NULL AUTO_INCREMENT,
  `idTarea` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `nombreOriginal` varchar(300) NOT NULL,
  `nombreArchivo` varchar(300) NOT NULL,
  `extension` varchar(20) DEFAULT NULL,
  `tamano` int(11) DEFAULT 0,
  `mimeType` varchar(100) DEFAULT NULL,
  `ruta` varchar(500) NOT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idArchivo`),
  KEY `idx_tarea` (`idTarea`),
  KEY `idx_usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla jira_historial
CREATE TABLE IF NOT EXISTS `jira_historial` (
  `idHistorial` int(11) NOT NULL AUTO_INCREMENT,
  `idTarea` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `valorAnterior` text DEFAULT NULL,
  `valorNuevo` text DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idHistorial`),
  KEY `idx_tarea` (`idTarea`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla jira_notas_calendario
CREATE TABLE IF NOT EXISTS `jira_notas_calendario` (
  `idNota` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `contenido` text DEFAULT NULL,
  `color` varchar(20) DEFAULT '#FFC107',
  `icono` varchar(100) DEFAULT 'mdi:note-outline',
  `idUsuarioCreador` int(11) DEFAULT NULL,
  `recordatorio` tinyint(1) DEFAULT 0,
  `horaRecordatorio` time DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idNota`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_usuario` (`idUsuarioCreador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------
-- CREAR VISTAS JIRA
-- ----------------------------------------

-- Eliminar vistas si existen para recrearlas
DROP VIEW IF EXISTS `jira_tareas_view`;
DROP VIEW IF EXISTS `jira_comentarios_view`;
DROP VIEW IF EXISTS `jira_archivos_view`;
DROP VIEW IF EXISTS `jira_notas_calendario_view`;

-- Vista para tareas
CREATE VIEW `jira_tareas_view` AS
SELECT
  t.idTarea, t.folio, t.idProyecto, t.idFase, t.titulo, t.descripcion,
  t.prioridad, t.fechaInicio, t.fechaVencimiento, t.orden,
  t.idUsuarioAsignado, t.idUsuarioCreador, t.fechaCreacion, t.fechaModificacion, t.bstate,
  p.nombre AS nombreProyecto, p.color AS colorProyecto,
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

-- Vista para comentarios
CREATE VIEW `jira_comentarios_view` AS
SELECT
  c.idComentario, c.idTarea, c.idUsuario, c.comentario, c.tipo,
  c.fechaCreacion, c.fechaModificacion, c.bstate,
  IFNULL(u.nombre, 'Sistema') AS nombreUsuario, IFNULL(u.apellidos, '') AS apellidosUsuario
FROM jira_comentarios c
LEFT JOIN usuarios u ON c.idUsuario = u.idUsuario
WHERE c.bstate = 1;

-- Vista para archivos
CREATE VIEW `jira_archivos_view` AS
SELECT
  a.idArchivo, a.idTarea, a.idUsuario, a.nombreOriginal, a.nombreArchivo,
  a.extension, a.tamano, a.mimeType, a.ruta,
  a.fechaCreacion, a.fechaModificacion, a.bstate,
  IFNULL(u.nombre, '') AS nombreUsuario, IFNULL(u.apellidos, '') AS apellidosUsuario
FROM jira_archivos a
LEFT JOIN usuarios u ON a.idUsuario = u.idUsuario
WHERE a.bstate = 1;

-- Vista para notas del calendario
CREATE VIEW `jira_notas_calendario_view` AS
SELECT
  n.idNota, n.fecha, n.titulo, n.contenido, n.color, n.icono,
  n.idUsuarioCreador, n.recordatorio, n.horaRecordatorio,
  n.fechaCreacion, n.fechaModificacion, n.bstate,
  IFNULL(u.nombre, '') AS nombreCreador, IFNULL(u.apellidos, '') AS apellidosCreador
FROM jira_notas_calendario n
LEFT JOIN usuarios u ON n.idUsuarioCreador = u.idUsuario
WHERE n.bstate = 1;

-- ========================================
-- FIN DE MIGRACIONES
-- ========================================
