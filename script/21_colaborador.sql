-- ============================================================
-- COLABORADOR ROLE + FORM SHARING
-- ============================================================

-- Add profesion field to usuarios
ALTER TABLE usuarios ADD COLUMN profesion VARCHAR(100) DEFAULT NULL AFTER email;

-- Add sharing token to cuestionarios for direct link access
ALTER TABLE cuestionarios ADD COLUMN compartirToken VARCHAR(64) DEFAULT NULL AFTER estado;
CREATE UNIQUE INDEX idx_compartir_token ON cuestionarios(compartirToken);

-- ============================================================
-- TRACKING TABLE FOR COLLABORATOR FORM VISITS
-- ============================================================
CREATE TABLE IF NOT EXISTS formulario_visitas (
  idVisita INT AUTO_INCREMENT PRIMARY KEY,
  idCuestionario INT NOT NULL,
  ip VARCHAR(45),
  userAgent TEXT,
  navegador VARCHAR(50),
  dispositivo VARCHAR(20),
  sistemaOperativo VARCHAR(50),
  referrer VARCHAR(500),
  duracionSegundos INT DEFAULT 0,
  scrollMaxPorcentaje INT DEFAULT 0,
  fechaVisita DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idCuestionario) REFERENCES cuestionarios(idCuestionario) ON DELETE CASCADE
);

CREATE INDEX idx_form_visitas_cuestionario ON formulario_visitas(idCuestionario);
CREATE INDEX idx_form_visitas_fecha ON formulario_visitas(fechaVisita);
