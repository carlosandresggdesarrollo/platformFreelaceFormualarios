-- ============================================================
-- ADD SLUG COLUMN TO CUESTIONARIOS
-- ============================================================

ALTER TABLE cuestionarios ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER compartirToken;
