-- ============================================================
--  Redes sociales configurables para el footer
-- ============================================================

CREATE TABLE IF NOT EXISTS home_redes_sociales (
  idRed INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(100) NOT NULL DEFAULT 'mdi:link',
  url VARCHAR(500) NOT NULL DEFAULT '#',
  orden INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  bstate TINYINT(1) NOT NULL DEFAULT 1,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos iniciales (solo si la tabla esta vacia)
INSERT INTO home_redes_sociales (nombre, icono, url, orden)
SELECT 'Facebook', 'mdi:facebook', '#', 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_redes_sociales LIMIT 1);

INSERT INTO home_redes_sociales (nombre, icono, url, orden)
SELECT 'Instagram', 'mdi:instagram', '#', 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_redes_sociales WHERE nombre = 'Instagram');

INSERT INTO home_redes_sociales (nombre, icono, url, orden)
SELECT 'TikTok', 'ic:baseline-tiktok', '#', 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_redes_sociales WHERE nombre = 'TikTok');

INSERT INTO home_redes_sociales (nombre, icono, url, orden)
SELECT 'YouTube', 'mdi:youtube', '#', 4 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_redes_sociales WHERE nombre = 'YouTube');
