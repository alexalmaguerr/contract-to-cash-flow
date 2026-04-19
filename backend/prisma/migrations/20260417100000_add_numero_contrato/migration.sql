-- AlterTable: add auto-increment numeric contract number
ALTER TABLE "contratos" ADD COLUMN "numero_contrato" SERIAL;

-- Create unique index
CREATE UNIQUE INDEX "contratos_numero_contrato_key" ON "contratos"("numero_contrato");
