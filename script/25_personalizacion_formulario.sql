-- ============================================================
-- Personalización visual y musical por formulario
-- ============================================================

ALTER TABLE cuestionarios
  ADD COLUMN tema VARCHAR(20) DEFAULT NULL AFTER slug,
  ADD COLUMN colorPrimario VARCHAR(7) DEFAULT NULL AFTER tema,
  ADD COLUMN colorFondo VARCHAR(7) DEFAULT NULL AFTER colorPrimario,
  ADD COLUMN imagenFondo VARCHAR(500) DEFAULT NULL AFTER colorFondo,
  ADD COLUMN musicaUrl VARCHAR(500) DEFAULT NULL AFTER imagenFondo,
  ADD COLUMN musicaTipo ENUM('archivo','youtube','url') DEFAULT NULL AFTER musicaUrl,
  ADD COLUMN opacidadFondo TINYINT UNSIGNED DEFAULT 40 AFTER musicaTipo;
