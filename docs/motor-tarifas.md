# Motor de Tarifas — Agua Periódica y Cotización

Hay dos motores de tarifas independientes: uno para cobro periódico (mensual), otro para cotización de conexión (cargo único al contratar).

---

## 1. Motor de Agua Periódica

**Archivos:** `src/lib/tarifas.ts` + `src/data/tarifas-agua.json`

**JSON generado** con `frontend/scripts/build-tarifas-json.cjs` desde el CSV del escritorio.

**Estructura JSON:**
```json
{ "[admin]": { "[tarifa]": { "precios": [], "precioBase200": 0, "precioM3Adicional": 0, "tasa": 0.16 } } }
```

### Reglas de cálculo (`calcularCargoPeriodo`)

```
consumo/unidad = m3Total / unidades  (fracción > 0.50 → sube, ≤ 0.50 → baja)

Si ≤ 200 m³/unidad:
  agua = precios[consumo] × unidades          (lookup de tabla)

Si > 200 m³/unidad:
  agua = (consumo × precioM3Adicional) × unidades + precioBase200  (fórmula)

Alcantarillado = 10% del importe agua (si aplica check)
Saneamiento    = 12% del importe agua (si aplica check)
Recargo        = saldoVencido acumulado × 0.01470 (1.470%/mes, desde mes 2)
```

### Parámetros que determinan el cálculo
- Administración (13 admins en CSV)
- Tipo de tarifa (hasta 12 tipos por admin)
- M³ total y unidades servidas
- Periodo inicio/fin (número de meses)
- Checks `aplicaAgua`, `aplicaAlcantarillado`, `aplicaSaneamiento`

**Resolución nombre→catálogo:** `resolveAdministracion()` y `resolveTipoTarifa()` en `tarifas.ts`.

---

## 2. Motor de Tarifas de Cotización (cargo único)

### Archivos

| Archivo | Propósito |
|---------|-----------|
| `frontend/scripts/build-cotizacion-json.cjs` | Script generador del JSON desde CSVs |
| `frontend/src/data/tarifas-contratacion.json` | JSON con tarifas precalculadas |
| `frontend/src/lib/cotizacion-tarifas.ts` | Funciones de cálculo |

### Fuentes CSV (escritorio)

| CSV | Datos |
|-----|-------|
| `Tarifas_contratacion.xlsx - TARIFAS POR VARIABLES longitud..csv` | Agua y drenaje por material+longitud |
| `Tarifas_contratacion.xlsx - TARIFAS POR VARIABLES diametro.csv` | Instalación medidor y medidor por diámetro |
| `Tarifas_contratacion.xlsx - TARIFAS POR CONCEPTO FIJO.csv` | Agua periódica (no usada en cotización) |
| `Tarifas_varios.xlsx - TARIFAS POR CONCEPTO FIJO.csv` | Conceptos varios: inspección, carta factibilidad, reconexión... |

### Estructura JSON (`tarifas-contratacion.json`)

```json
{
  "[ADMIN]": {
    "longitud": {
      "agua":   { "[CLAVE_MAT]": { "precioBase": 0, "precioProporcional": 0, "tasa": 0.16 } },
      "drenaje": { ... }
    },
    "medidor": {
      "instalacion":  { "[diametroKey]": { "precio": 0, "tasa": 0.16 } },
      "medidorTipos": { "[tipo_diam_plan]": { "precio": 0, "tasa": 0.16 } }
    }
  }
}
```

13 admins | agua: 10 combos | drenaje: 9 combos | instalación: 4 grupos | medidorTipos: 5 opciones

### Fórmula agua y drenaje

```
excedente  = max(0, metros - 6)   // primeros 6m incluidos en precioBase
precioNeto = precioBase + excedente × precioProporcional
IVA        = precioNeto × tasa (0.16)
```

### Clave de tarifa de longitud

Formato: `{resolveMatCalle(matCalle)}-{resolveMatBanqueta(matBanqueta)}`

Ejemplo: calle `concreto_hidraulico` + banqueta `concreto_hidraulico` → `CONCRETO-CONCRETO`

Combos disponibles:
`LOSA-CANTERA`, `CONCRETO-CONCRETO`, `CONCRETO-ASFALTO`, `CONCRETO-ADOCRETO`,
`CONCRETO-EMPEDRADO`, `LOSA-ADOQUIN`, `CONCRETO-TERRACERIA`, `TERRACERÍA-TERRACERÍA`,
`TERRACERÍA-EMPEDRADO`, `ADOQUIN-ADOQUIN`

### Grupos de instalación de medidor

| Diámetro toma | Clave JSON | Precio neto |
|---------------|-----------|-------------|
| `1/2"`, `3/4"`, `1"` | `1/2-3/4-1` | $984.11 |
| `2"` | `2` | $2,426.91 |
| `3"` | `3` | $2,730.27 |
| `4"` | `4` | $2,932.51 |

### API pública (`cotizacion-tarifas.ts`)

```ts
calcularDerechosAgua(adminNombre, matCalle, matBanqueta, metros) → { precioNeto, tasa, iva, total }
calcularDerechosDrenaje(...)   → mismo shape
calcularInstalacionMedidor(adminNombre, diametroToma) → { precioNeto, tasa, iva, total }
resolveMatCalle(mat)           → normaliza clave inspección → nombre CSV
resolveMatBanqueta(mat)        → ídem
resolveAdminContratacion(nombre) → normaliza nombre admin → clave catálogo
```

### Conceptos calculados en `calcularCotizacionDesdeCuantificacion` (Solicitudes.tsx)

1. Derechos conexión red de agua (si `mlToma > 0`)
2. Derechos conexión red de drenaje (si `mlDescarga > 0`)
3. Instalación de medidor (por `diametroToma`)
4. Medidor pieza física (por `tipoMedidor` + `planPagoMedidor`)

Los campos de material y metros vienen de `CuantificacionData` con fallback a `SolicitudInspeccion`.

---

## Tareas pendientes

- [ ] Incrementales automáticos (% o directo) sobre tarifas existentes
- [ ] Modificaciones masivas por administración desde UI
- [ ] Vigencias históricas (CSV actual es solo Feb-2026)
- [ ] Backend: tablas con vigencias en lugar de JSON estático
