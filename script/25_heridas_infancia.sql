-- ============================================================
-- HERIDAS DE INFANCIA - Cuestionario de 50 preguntas
-- Marco: Rodrigo García Platas
-- ============================================================

CREATE TABLE IF NOT EXISTS herida_sesiones (
    idSesion INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT DEFAULT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    preguntaActual INT DEFAULT 1,
    completado TINYINT(1) DEFAULT 0,
    -- Contadores por herida
    conteoR INT DEFAULT 0,
    conteoA INT DEFAULT 0,
    conteoH INT DEFAULT 0,
    conteoT INT DEFAULT 0,
    conteoI INT DEFAULT 0,
    -- Resultado calculado
    heridaDominante CHAR(1) DEFAULT NULL,
    heridaSecundaria CHAR(1) DEFAULT NULL,
    porcentajeDominante DECIMAL(5,1) DEFAULT NULL,
    porcentajeSecundaria DECIMAL(5,1) DEFAULT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaCompletado DATETIME DEFAULT NULL,
    INDEX idx_herida_email (email),
    INDEX idx_herida_usuario (idUsuario),
    INDEX idx_herida_completado (completado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS herida_respuestas (
    idRespuesta INT AUTO_INCREMENT PRIMARY KEY,
    idSesion INT NOT NULL,
    numeroPregunta INT NOT NULL,
    heridaCode CHAR(1) NOT NULL COMMENT 'R=Rechazo, A=Abandono, H=Humillacion, T=Traicion, I=Injusticia',
    fechaRespuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hresp_sesion (idSesion),
    UNIQUE KEY uk_sesion_pregunta (idSesion, numeroPregunta),
    FOREIGN KEY (idSesion) REFERENCES herida_sesiones(idSesion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
