-- Add requiere_inspeccion flag to tipos_contratacion
-- Defaults to true (all existing tipos keep inspection flow)
ALTER TABLE "tipos_contratacion"
  ADD COLUMN IF NOT EXISTS "requiere_inspeccion" BOOLEAN NOT NULL DEFAULT true;
