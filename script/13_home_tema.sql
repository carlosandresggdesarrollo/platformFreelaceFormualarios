-- ============================================================
--  Migracion: agregar columna tema a home_config
--  Permite seleccionar entre 5 temas visuales para la landing.
-- ============================================================

ALTER TABLE home_config
  ADD COLUMN IF NOT EXISTS tema VARCHAR(50) NOT NULL DEFAULT 'corporativo';
