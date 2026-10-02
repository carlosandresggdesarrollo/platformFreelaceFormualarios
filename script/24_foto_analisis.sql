-- Tabla para almacenar análisis de fotos por IA para determinación de biotipo
CREATE TABLE IF NOT EXISTS biotipo_foto_analisis (
    idAnalisis INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT DEFAULT NULL,
    nombrePersona VARCHAR(255) DEFAULT NULL,
    rutaFoto VARCHAR(500) NOT NULL,
    biotipoSugerido CHAR(1) DEFAULT NULL COMMENT 'S/C/M/F',
    biotipoSecundario CHAR(1) DEFAULT NULL COMMENT 'S/C/M/F',
    confianza INT DEFAULT 0 COMMENT 'Porcentaje de confianza 0-100',
    analisisTexto MEDIUMTEXT COMMENT 'Análisis completo de la IA',
    caracteristicas JSON COMMENT 'Detalle de características detectadas',
    modelo VARCHAR(100) DEFAULT NULL,
    tokensUsados INT DEFAULT 0,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_foto_usuario (idUsuario),
    INDEX idx_foto_fecha (fechaCreacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
