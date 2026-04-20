# Catálogo SAT (CFDI — Anexo 20)

## Origen de datos

Los valores sembrados coinciden con el libro **`Catálogos del SAT.xlsx`** (hojas *Régimen Fiscal* y *Uso del CFDI*), ubicado en la documentación interna del sistema anterior. Esa ruta está en `.gitignore`; en entornos nuevos el Excel puede no existir, pero la **semilla** en el repositorio (`backend/prisma/catalogo-sat-seed-data.ts`) conserva el mismo contenido.

## Modelo y API

- **Tabla** `catalogo_sat` con `tipo`: `REGIMEN_FISCAL` | `USO_CFDI`, clave SAT, descripción, banderas de aplicación a persona física/moral, vigencias, y (para uso CFDI) texto de régimenes receptores permitidos según el Excel.
- **Endpoints** (JWT, mismo prefijo que otros catálogos de contratación):
  - `GET /api/catalogos/sat` — todos los registros activos/inactivos según query.
  - `GET /api/catalogos/sat?tipo=REGIMEN_FISCAL`
  - `GET /api/catalogos/sat?tipo=USO_CFDI`

## Operación local

Después de traer cambios:

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

La pantalla **Configuración → Catálogos → SAT · CFDI** muestra ambas tablas en solo lectura.

## Actualización desde Excel

Si el SAT publica una versión nueva del libro y se coloca el `.xlsx` localmente, puedes volcar hojas con `xlsx` (como en reconocimientos previos del proyecto) y actualizar **`catalogo-sat-seed-data.ts`** o ejecutar un script de importación dedicado; luego `npm run prisma:seed` para `upsert` idempotente.
