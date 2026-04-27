# Flujo de Contratación — Estado de implementación

## Flujo principal (funcional)

```
solicitud → factibilidad → contrato → instalacion_toma → instalacion_medidor → alta → contrato.estado = "Activo"
```

### Estados de solicitud
`pendiente_revision` → `inspeccion_requerida` → `inspeccion_en_proceso` → `en_cotizacion` → `aceptada` → `contratado`
También: `rechazada`, `cancelada`

### Tipos INDIVIDUAL (`esIndividualizacion = true`)
- Saltan inspección → van directo a cotización
- `requiereInspeccion = false` en DB
- Mitigación frontend en `tipoInspeccionMap`: `(t.requiereInspeccion ?? true) && !t.esIndividualizacion`

---

## Páginas con API real vs stubs

| Página | Estado |
|--------|--------|
| Contratos | ✅ real (`fetchContratos`) |
| Factibilidades | ✅ real (`fetchProcesos`, `avanzarEtapa`) |
| Construcciones | ✅ real (`fetchOrdenes`, `updateOrdenEstado`) |
| Dashboard | ✅ 6 queries reales |
| Lecturas, Pagos, PuntosServicio | ✅ real |
| `/timbrados`, `/prefacturas`, `/consumos` | ⚠️ backend devuelve `[]` hardcodeado |
| Rutas, Medidores | ❌ DataContext mock |

---

## CuantificacionModal

`src/components/solicitudes/CuantificacionModal.tsx`

**Secciones:** Encabezado → Ubicación → Requerimientos → Servicios de agua

**Periodo:** `periodoInicio` (mes/año) + botones preset `3 / 6 / 9 / 12` meses → `periodoFin` auto-calculado.

**Proyección de cobro:** tabla automática (aparece con m³ > 0) — columnas: Agua / Alcantarillado / Saneamiento / Recargo / Total. Usa `calcularCargoPeriodo` de `tarifas.ts`.

**Flujo:**
```
CuantificacionModal → onAceptar(data)
    → CotizacionModal (recibe cuantificacionData)
    → calcularCotizacionDesdeCuantificacion(cuant, insp?)
    → precios reales del CSV
```

**Campos de requerimientos en `CuantificacionData`:**
- `matCalle`, `matBanqueta` — material calle/banqueta (read-only si hay inspección)
- `mlToma`, `mlDescarga` — metros lineales toma/descarga
- `diametroToma`, `diametroDescarga` — diámetros seleccionados
- `tipoMedidor`, `planPagoMedidor` — para cotización de medidor
- `adminNombre` — requerido para lookup de tarifas
- `numMeses`, `periodoInicio`, `periodoFin` — proyección de cobro
- `aplicaAgua`, `aplicaAlcantarillado`, `aplicaSaneamiento` — checkboxes

---

## PDFs implementados

### 1. PDF de Cotización (`src/lib/cotizacion-pdf.tsx`)
- Secciones: Contratante → Datos del Servicio → Requerimientos → Cuantificación (tabla 8 cols con IVA) → CONTADO/CONVENIO → OBSERVACIONES → Elaboró
- Botones en `CotizacionModal` (antes de aceptar) y `VerSolicitudDialog`
- Al aceptar: genera PDF, lo sube al servidor + guarda `cotizacionItems` en `formData`

### 2. PDF de Cobro del Agua (`src/lib/cobro-agua-pdf.tsx`)
- Formato landscape LETTER, tabla 11 columnas mensual + resumen
- Usa tarifas reales del catálogo CSV (Feb-2026) via `src/lib/tarifas.ts`

---

## Migración pendiente en servidor

- `20260420150000_individual_no_requiere_inspeccion` — pendiente de aplicar en GCP
- `start:prod` ya tiene `prisma migrate deploy &&` — se aplicará en el próximo deploy de EasyPanel
