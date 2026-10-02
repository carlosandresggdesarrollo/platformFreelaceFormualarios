-- ========================================
-- Módulo DeepSeek: configuración y consumo de tokens
-- Base de datos: administrador
-- (El modelo también crea estas tablas automáticamente si no existen.)
-- ========================================

CREATE TABLE IF NOT EXISTS `deepseek_config` (
  `idConfig` INT AUTO_INCREMENT PRIMARY KEY,
  `apiKey` TEXT,
  `baseUrl` VARCHAR(255) DEFAULT 'https://api.deepseek.com',
  `modeloDefault` VARCHAR(100) DEFAULT 'deepseek-v4-pro',
  `fechaModificacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `deepseek_uso` (
  `idUso` INT AUTO_INCREMENT PRIMARY KEY,
  `modelo` VARCHAR(100),
  `promptTokens` INT DEFAULT 0,
  `completionTokens` INT DEFAULT 0,
  `totalTokens` INT DEFAULT 0,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_deepseek_uso_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sesiones de chat guardadas
CREATE TABLE IF NOT EXISTS `deepseek_sesiones` (
  `idSesion` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(255) DEFAULT 'Nueva conversación',
  `modelo` VARCHAR(100) DEFAULT 'deepseek-v4-pro',
  `fechaCreacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fechaActualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` INT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `deepseek_mensajes` (
  `idMensaje` INT AUTO_INCREMENT PRIMARY KEY,
  `idSesion` INT NOT NULL,
  `rol` VARCHAR(20),
  `contenido` MEDIUMTEXT,
  `display` MEDIUMTEXT,
  `adjunto` VARCHAR(255),
  `promptTokens` INT DEFAULT 0,
  `completionTokens` INT DEFAULT 0,
  `totalTokens` INT DEFAULT 0,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ds_msg_sesion` (`idSesion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tareas programadas (scheduler) y sus resultados
CREATE TABLE IF NOT EXISTS `deepseek_tareas` (
  `idTarea` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(255),
  `instruccion` MEDIUMTEXT,
  `modelo` VARCHAR(100) DEFAULT 'deepseek-v4-pro',
  `tipo` VARCHAR(20) DEFAULT 'diaria',
  `hora` VARCHAR(5) DEFAULT '06:00',
  `diaSemana` INT DEFAULT NULL,
  `intervaloMinutos` INT DEFAULT NULL,
  `activo` INT DEFAULT 1,
  `ultimaEjecucion` DATETIME DEFAULT NULL,
  `proximaEjecucion` DATETIME DEFAULT NULL,
  `fechaCreacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` INT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `deepseek_tareas_resultados` (
  `idResultado` INT AUTO_INCREMENT PRIMARY KEY,
  `idTarea` INT NOT NULL,
  `contenido` MEDIUMTEXT,
  `totalTokens` INT DEFAULT 0,
  `estado` VARCHAR(10) DEFAULT 'OK',
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ds_res_tarea` (`idTarea`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Fila inicial de configuración (vacía)
INSERT INTO `deepseek_config` (`apiKey`, `baseUrl`, `modeloDefault`)
SELECT '', 'https://api.deepseek.com', 'deepseek-v4-pro'
WHERE NOT EXISTS (SELECT 1 FROM `deepseek_config`);


