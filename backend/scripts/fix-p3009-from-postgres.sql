-- Ejecutar desde el contenedor de PostgreSQL (sin necesidad del backend).
-- Uso: docker exec -it hydra_hydra-db.1.xxxxx psql -U postgres -d hydra
--     Pegar este SQL y ejecutar.

-- 1. Limpiar tabla si quedó en estado parcial
DROP TABLE IF EXISTS "sige_hydra" CASCADE;

-- 2. Marcar la migración como APLICADA (omitirla; la siguiente crea la estructura correcta)
UPDATE "_prisma_migrations"
SET "finished_at" = COALESCE("started_at", NOW()),
    "rolled_back_at" = NULL
WHERE "migration_name" = '20260302000000_add_sige_hydra';
