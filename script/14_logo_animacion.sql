-- ============================================================
-- 14. Logo + Animacion de fondo
-- ============================================================

ALTER TABLE home_config ADD COLUMN logo VARCHAR(255) DEFAULT NULL;
ALTER TABLE home_config ADD COLUMN animacionFondo VARCHAR(50) NOT NULL DEFAULT 'minimalista';
