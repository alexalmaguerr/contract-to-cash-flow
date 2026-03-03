#!/bin/sh
# Ejecutar desde la CONSOLA del contenedor backend en Easypanel.
# DATABASE_URL ya viene del entorno del contenedor.
#
# Desde consola del contenedor:
#   cd /app && sh scripts/run-fix-migration.sh

set -e
cd "$(dirname "$0")/.."
npm run migrate:fix-p3009
echo "Listo. Reinicia el servicio en Easypanel."
