-- Migration: feat_prd_catalogos_tarifas_procesos
-- PRD 2026-04-06: Catálogos de zona de facturación, código de recorrido,
--                 fórmulas tarifarias en conceptos de cobro.

-- ─── Catálogo: Zona de Facturación ───────────────────────────────────────────
CREATE TABLE "catalogo_zonas_facturacion" (
    "id"          TEXT NOT NULL,
    "codigo"      TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo"      BOOLEAN NOT NULL DEFAULT true,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_zonas_facturacion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "catalogo_zonas_facturacion_codigo_key" ON "catalogo_zonas_facturacion"("codigo");

-- ─── Catálogo: Código de Recorrido ───────────────────────────────────────────
CREATE TABLE "catalogo_codigos_recorrido" (
    "id"          TEXT NOT NULL,
    "codigo"      TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ruta_id"     TEXT,
    "activo"      BOOLEAN NOT NULL DEFAULT true,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_codigos_recorrido_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "catalogo_codigos_recorrido_codigo_key" ON "catalogo_codigos_recorrido"("codigo");

-- ─── Puntos de Servicio: añadir zona_facturacion_id y codigo_recorrido_id ────
ALTER TABLE "puntos_servicio"
    ADD COLUMN "zona_facturacion_id" TEXT,
    ADD COLUMN "codigo_recorrido_id" TEXT;

CREATE INDEX "puntos_servicio_zona_facturacion_id_idx" ON "puntos_servicio"("zona_facturacion_id");
CREATE INDEX "puntos_servicio_codigo_recorrido_id_idx"  ON "puntos_servicio"("codigo_recorrido_id");

ALTER TABLE "puntos_servicio"
    ADD CONSTRAINT "puntos_servicio_zona_facturacion_id_fkey"
        FOREIGN KEY ("zona_facturacion_id") REFERENCES "catalogo_zonas_facturacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "puntos_servicio"
    ADD CONSTRAINT "puntos_servicio_codigo_recorrido_id_fkey"
        FOREIGN KEY ("codigo_recorrido_id") REFERENCES "catalogo_codigos_recorrido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Conceptos de Cobro: fórmula tarifaria de contratación (req PRD #26) ─────
ALTER TABLE "conceptos_cobro"
    ADD COLUMN "formula"          TEXT,
    ADD COLUMN "variables_formula" JSONB;
