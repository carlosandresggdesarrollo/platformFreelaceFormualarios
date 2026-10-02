-- ============================================================
-- 22. MODULO CLIENTE: Login tracking, juego con ranking
-- ============================================================

-- Tracking de sesiones de login (seguridad admin)
CREATE TABLE IF NOT EXISTS sesiones_login (
  idSesionLogin INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  ip VARCHAR(45),
  navegador VARCHAR(255),
  dispositivo VARCHAR(100),
  sistemaOperativo VARCHAR(100),
  fechaLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_usuario (idUsuario),
  INDEX idx_login_fecha (fechaLogin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Puntajes del juego de memoria
CREATE TABLE IF NOT EXISTS juego_puntajes (
  idPuntaje INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  juego VARCHAR(50) NOT NULL DEFAULT 'memoria',
  puntaje INT NOT NULL DEFAULT 0,
  movimientos INT DEFAULT 0,
  tiempoSegundos INT DEFAULT 0,
  nivel VARCHAR(20) DEFAULT 'normal',
  fechaJuego DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_juego_usuario (idUsuario),
  INDEX idx_juego_puntaje (puntaje DESC),
  INDEX idx_juego_tipo (juego)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vincular respuestas de cuestionario con usuario logueado
ALTER TABLE cuestionario_respuestas_sesion
  ADD COLUMN IF NOT EXISTS idUsuario INT DEFAULT NULL AFTER idCuestionario;
