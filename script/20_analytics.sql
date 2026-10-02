-- ============================================================
--  Modulo de Analiticas / Estadisticas de visitantes
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_visitas (
  idVisita INT AUTO_INCREMENT PRIMARY KEY,
  pagina VARCHAR(255) NOT NULL,
  ip VARCHAR(45),
  userAgent TEXT,
  navegador VARCHAR(100),
  dispositivo VARCHAR(50),
  sistemaOperativo VARCHAR(100),
  referrer VARCHAR(500),
  idioma VARCHAR(20),
  resolucionPantalla VARCHAR(20),
  duracionSegundos INT DEFAULT 0,
  scrollMaxPorcentaje INT DEFAULT 0,
  fechaVisita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pagina (pagina),
  INDEX idx_fecha (fechaVisita),
  INDEX idx_ip (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analytics_eventos (
  idEvento INT AUTO_INCREMENT PRIMARY KEY,
  idVisita INT,
  tipoEvento ENUM('click','scroll_depth','seccion_vista','salida') NOT NULL,
  detalle VARCHAR(500),
  valor INT DEFAULT 0,
  fechaEvento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visita (idVisita),
  INDEX idx_tipo (tipoEvento),
  INDEX idx_fecha (fechaEvento),
  FOREIGN KEY (idVisita) REFERENCES analytics_visitas(idVisita) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
