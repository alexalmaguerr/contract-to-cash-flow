# Variables de Contratación — Códigos Reservados

Sistema para conectar las variables capturadas en el formulario de solicitud con los cálculos de cotización.

## Problema

`variablesCapturadas` guarda `{ [codigo]: valor }` pero los `codigo` son arbitrarios. La cotización no puede leer valores de inspección/solicitud automáticamente sin saber qué clave buscar.

## Solución: códigos reservados (sin cambio de schema)

Convención de datos: definir `codigo` fijos en `TipoVariable` con semántica conocida por el sistema.

- `PasoVariables` renderiza UI especializada cuando detecta estos códigos
- `CuantificacionModal` los lee para pre-llenar el formulario
- `calcularCotizacionDesdeCuantificacion` los usa directamente

Otros códigos funcionan como texto libre (`{{codigo}}` en contrato) pero no alimentan cálculos.

---

## Tabla de códigos reservados

| Código | tipoDato | UI en PasoVariables | Alimenta cotización como |
|--------|----------|---------------------|--------------------------|
| `DIAMETRO_TOMA` | LISTA | Select: ½", ¾", 1", 1.5", 2", 3", 4" | `diametroToma` → `calcularInstalacionMedidor()` |
| `DIAMETRO_DESCARGA` | LISTA | Select: ½", ¾", 1", 1.5", 2", 3", 4" | `diametroDescarga` |
| `METROS_TOMA` | NUMERO | Input numérico (m.l.) | `mlToma` → `calcularDerechosAgua()` |
| `METROS_DESCARGA` | NUMERO | Input numérico (m.l.) | `mlDescarga` → `calcularDerechosDrenaje()` |
| `MATERIAL_CALLE` | LISTA | Select: concreto / losa / adoquin / concreto_asfaltico / empedrado / tierra | `matCalle` → lookup CSV |
| `MATERIAL_BANQUETA` | LISTA | Select: concreto / asfalto / adoquin / adocreto / empedrado / tierra / cantera | `matBanqueta` → lookup CSV |
| `UNIDADES_SERVIDAS` | NUMERO | Input entero | `unidadesServidas` en agua periódica |
| `TIPO_MEDIDOR` | LISTA | velocidad / volumétrico / mayor | tipo de medidor |
| `PLAN_PAGO_MEDIDOR` | LISTA | contado / 12 parcialidades / 24 parcialidades | plan de pago |

---

## Flujo de datos

```
TiposContratacion → asigna variables con códigos estándar
    ↓
SolicitudServicio / PasoVariables → captura valores del usuario
    ↓
solicitud.formData.variablesCapturadas = { DIAMETRO_TOMA: '1"', METROS_TOMA: 8, ... }
    ↓
CuantificacionModal → lee variablesCapturadas para pre-llenar form
    (inspección tiene prioridad si existe; variables capturadas como fallback)
    ↓
CuantificacionData = { adminNombre, diametroToma, matCalle, matBanqueta, mlToma, mlDescarga, ... }
    ↓
calcularCotizacionDesdeCuantificacion() → precios reales del CSV
```

---

## Archivos relevantes

| Archivo | Rol |
|---------|-----|
| `frontend/src/components/contratacion/steps/PasoVariables.tsx` | Renderiza inputs especializados por código reservado |
| `frontend/src/components/solicitudes/CuantificacionModal.tsx` | Lee `variablesCapturadas` para pre-llenar |
| `frontend/src/pages/Solicitudes.tsx` | `calcularCotizacionDesdeCuantificacion()` |
| `frontend/src/lib/cotizacion-tarifas.ts` | Funciones de lookup en tarifas CSV |
| `frontend/src/pages/VariablesContratacion.tsx` | UI para crear/asignar TipoVariable al catálogo |
| `backend/prisma/migrations/20260426100000_seed_tipos_variable_estandar/migration.sql` | Seed inicial de los 9 TipoVariable estándar |

---

## Estado de implementación

- [x] `PasoVariables` — selects especializados para códigos reservados
- [x] `CuantificacionModal` — pre-llenado desde `variablesCapturadas` con prioridad a inspección
- [x] `calcularCotizacionDesdeCuantificacion` — usa `cuant.matCalle/matBanqueta/mlToma/mlDescarga`
- [x] Migración seed DB — `20260426100000_seed_tipos_variable_estandar`
- [ ] Asignar los TipoVariable semánticos a los TiposContratacion correspondientes en el catálogo
