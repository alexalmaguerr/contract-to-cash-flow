-- DropTable (estructura anterior incompatible)
DROP TABLE IF EXISTS "sige_hydra";

-- CreateTable (nueva estructura: cnttnum, cnttrefant, contrato_id)
CREATE TABLE "sige_hydra" (
    "id" TEXT NOT NULL,
    "cnttnum" TEXT NOT NULL,
    "cnttrefant" TEXT NOT NULL,
    "contrato_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sige_hydra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sige_hydra_cnttnum_key" ON "sige_hydra"("cnttnum");

-- CreateIndex
CREATE INDEX "sige_hydra_contrato_id_idx" ON "sige_hydra"("contrato_id");

-- CreateIndex
CREATE INDEX "sige_hydra_cnttrefant_idx" ON "sige_hydra"("cnttrefant");

-- AddForeignKey
ALTER TABLE "sige_hydra" ADD CONSTRAINT "sige_hydra_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
