-- Cuestionarios
CREATE TABLE IF NOT EXISTS cuestionarios (
  idCuestionario INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado ENUM('borrador','publicado','cerrado') NOT NULL DEFAULT 'borrador',
  creadoPor INT,
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Preguntas
CREATE TABLE IF NOT EXISTS cuestionario_preguntas (
  idPregunta INT AUTO_INCREMENT PRIMARY KEY,
  idCuestionario INT NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  textoPregunta TEXT NOT NULL,
  FOREIGN KEY (idCuestionario) REFERENCES cuestionarios(idCuestionario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opciones (hasta 5 por pregunta)
CREATE TABLE IF NOT EXISTS cuestionario_opciones (
  idOpcion INT AUTO_INCREMENT PRIMARY KEY,
  idPregunta INT NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  textoOpcion VARCHAR(500) NOT NULL,
  esCorrecta TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (idPregunta) REFERENCES cuestionario_preguntas(idPregunta) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sesiones de respuesta (un visitante que contesta un cuestionario)
CREATE TABLE IF NOT EXISTS cuestionario_respuestas_sesion (
  idSesion INT AUTO_INCREMENT PRIMARY KEY,
  idCuestionario INT NOT NULL,
  nombreParticipante VARCHAR(100),
  emailParticipante VARCHAR(255),
  fechaInicio DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechaFin DATETIME,
  FOREIGN KEY (idCuestionario) REFERENCES cuestionarios(idCuestionario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Respuestas individuales
CREATE TABLE IF NOT EXISTS cuestionario_respuestas (
  idRespuesta INT AUTO_INCREMENT PRIMARY KEY,
  idSesion INT NOT NULL,
  idPregunta INT NOT NULL,
  idOpcion INT NOT NULL,
  FOREIGN KEY (idSesion) REFERENCES cuestionario_respuestas_sesion(idSesion) ON DELETE CASCADE,
  FOREIGN KEY (idPregunta) REFERENCES cuestionario_preguntas(idPregunta) ON DELETE CASCADE,
  FOREIGN KEY (idOpcion) REFERENCES cuestionario_opciones(idOpcion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
