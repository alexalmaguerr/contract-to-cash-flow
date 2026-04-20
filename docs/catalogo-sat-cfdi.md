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

En el menú lateral: **Configuración → Catálogos SAT (CFDI)** (`/app/catalogos-sat`) abre directamente las tablas SAT **sin** la cinta de pestañas del resto de catálogos CIG2018 (misma pantalla que **Catálogos**, pero filtrada a SAT). También están en **Configuración → Catálogos CIG2018**, pestaña **SAT · CFDI**.

## Comportamiento en solicitudes (paso fiscal)

En **Solicitud de servicio**, cuando hay API activa:

1. **Régimen fiscal**: solo filas cuyas banderas `aplicaFisica` / `aplicaMoral` coinciden con el tipo de persona elegido.
2. **Uso del CFDI**: solo filas que (a) aplican al mismo tipo de persona y (b) incluyen el régimen fiscal seleccionado en la lista `regimenesReceptorPermitidos` (columna SAT «Régimen Fiscal Receptor», separada por comas).

Si no hay régimen seleccionado, el uso del CFDI permanece deshabilitado hasta elegir régimen. Al cambiar tipo de persona o régimen, se limpian selecciones que dejen de ser válidas.

Sin API, se usan listas estáticas en `frontend/src/lib/sat-catalog-fallback.ts` (misma lógica de filtrado; antes vivían solo en `SolicitudServicio.tsx`).

## Comportamiento en registro de contrato (wizard, paso Personas)

En **Registro de contrato** → paso **Personas** (titular y persona fiscal), la misma regla aplica: tras elegir **tipo de persona**, **Régimen fiscal** y **Uso del CFDI** son selects alimentados por `GET /catalogos/sat` (o el fallback anterior si no hay API). Los valores guardados en el formulario son las **claves SAT** (p. ej. `605`, `G03`); al enviar el alta, el régimen del titular y de la persona fiscal se normalizan a clave en el cliente.

## Actualización desde Excel

Si el SAT publica una versión nueva del libro y se coloca el `.xlsx` localmente, puedes volcar hojas con `xlsx` (como en reconocimientos previos del proyecto) y actualizar **`catalogo-sat-seed-data.ts`** o ejecutar un script de importación dedicado; luego `npm run prisma:seed` para `upsert` idempotente.
