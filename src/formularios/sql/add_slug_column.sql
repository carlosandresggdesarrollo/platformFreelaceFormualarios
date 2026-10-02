-- Migration: Add slug column to cuestionarios table
-- Run this on the database to enable slug-based URLs

ALTER TABLE cuestionarios ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER compartirToken;

-- Generate slugs for existing records
UPDATE cuestionarios SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(titulo, ' ', '-'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u')) WHERE slug IS NULL;
