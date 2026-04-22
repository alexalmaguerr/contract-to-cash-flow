-- Tipos de individualización no requieren inspección previa
-- (ya tienen la infraestructura desde el contrato padre)
UPDATE "tipos_contratacion"
SET "requiere_inspeccion" = false
WHERE "es_individualizacion" = true;
