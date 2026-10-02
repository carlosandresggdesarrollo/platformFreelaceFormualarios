-- ============================================================
--  Esquema de los módulos nuevos de la plataforma.
--  Idempotente (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS):
--  seguro de ejecutar en una BD nueva o ya existente.
--  Los modelos PHP también crean estas tablas al usarse; este archivo
--  las deja registradas/documentadas y disponibles desde el primer arranque.
-- ============================================================

-- ----------------------- CORREO -----------------------
CREATE TABLE IF NOT EXISTS correo_cuentas (
  idCuenta INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NULL,
  email VARCHAR(200) NULL,
  contrasena TEXT NULL,
  imapHost VARCHAR(150) NULL,
  imapPort INT DEFAULT 993,
  imapSSL TINYINT DEFAULT 1,
  smtpHost VARCHAR(150) NULL,
  smtpPort INT DEFAULT 587,
  smtpSeguridad VARCHAR(10) DEFAULT 'tls',
  firma TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------- NOTIFICACIONES PUSH -----------------------
CREATE TABLE IF NOT EXISTS push_tokens (
  idToken INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  plataforma VARCHAR(20) DEFAULT 'android',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS correo_push_estado (
  idCuenta INT PRIMARY KEY,
  ultimoUid INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------- SSH (terminal web) -----------------------
CREATE TABLE IF NOT EXISTS ssh_servidores (
  idServidor INT AUTO_INCREMENT PRIMARY KEY,
  idUsuarioCreador INT NULL,
  nombre VARCHAR(120) NOT NULL,
  host VARCHAR(255) NOT NULL,
  puerto INT NOT NULL DEFAULT 22,
  usuario VARCHAR(120) NOT NULL,
  contrasena TEXT NULL,
  llavePrivada LONGTEXT NULL,
  passphrase TEXT NULL,
  fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  bstate TINYINT NOT NULL DEFAULT 1,
  INDEX idx_ssh_usuario (idUsuarioCreador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------- DIAGRAMAS ER -----------------------
CREATE TABLE IF NOT EXISTS er_proyectos (
  idProyectoER INT AUTO_INCREMENT PRIMARY KEY,
  idUsuarioCreador INT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT NULL,
  contenidoJSON LONGTEXT NULL,
  bstate TINYINT NOT NULL DEFAULT 1,
  fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fechaActualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------- IA (logs) + GitHub OAuth -----------------------
CREATE TABLE IF NOT EXISTS ia_logs (
  idLog INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT DEFAULT NULL,
  modulo VARCHAR(60) DEFAULT 'Chat',
  accion VARCHAR(80) DEFAULT '',
  resumen VARCHAR(600) DEFAULT NULL,
  modelo VARCHAR(100) DEFAULT NULL,
  tokensPrompt INT DEFAULT 0,
  tokensCompletion INT DEFAULT 0,
  tokensTotal INT DEFAULT 0,
  exito TINYINT DEFAULT 1,
  error VARCHAR(600) DEFAULT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ialog_modulo (modulo),
  INDEX idx_ialog_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------- AGENDA (hora para alarmas) -----------------------
CREATE TABLE IF NOT EXISTS agenda_tareas (
  idTarea INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255),
  descripcion TEXT,
  tipo VARCHAR(20) DEFAULT 'unica',
  fecha DATE NULL,
  diasSemana VARCHAR(20) NULL,
  color VARCHAR(20) DEFAULT '#1976D2',
  hora TIME NULL,
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  bstate INT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE agenda_tareas ADD COLUMN IF NOT EXISTS hora TIME NULL;

CREATE TABLE IF NOT EXISTS agenda_completados (
  idCompletado INT AUTO_INCREMENT PRIMARY KEY,
  idTarea INT NOT NULL,
  fecha DATE NOT NULL,
  realizado TINYINT DEFAULT 1,
  fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tarea_fecha (idTarea, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------- LIBROS PDF -----------------------
CREATE TABLE IF NOT EXISTS pdf_libros (
  idLibro INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NULL,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(200) NULL,
  descripcion TEXT NULL,
  archivo VARCHAR(255) NOT NULL,
  paginas INT DEFAULT 0,
  tamano BIGINT DEFAULT 0,
  portada VARCHAR(255) NULL,
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  bstate TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE pdf_libros ADD COLUMN IF NOT EXISTS autor VARCHAR(200) NULL;
ALTER TABLE pdf_libros ADD COLUMN IF NOT EXISTS descripcion TEXT NULL;

