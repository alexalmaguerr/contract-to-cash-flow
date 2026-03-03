-- Limpia tabla sige_hydra si quedó en estado parcial.
-- Uso: npm run migrate:fix-p3009 (con DATABASE_URL apuntando a la BD)
DROP TABLE IF EXISTS "sige_hydra" CASCADE;
