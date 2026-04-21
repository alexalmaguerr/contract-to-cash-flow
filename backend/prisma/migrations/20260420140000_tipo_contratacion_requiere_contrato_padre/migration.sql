ALTER TABLE "tipos_contratacion"
  ADD COLUMN IF NOT EXISTS "es_individualizacion" BOOLEAN NOT NULL DEFAULT false;

-- Auto-mark tipos with "Individual" in their name
UPDATE "tipos_contratacion"
SET "es_individualizacion" = true
WHERE upper("nombre") LIKE '%INDIVIDUAL%';
