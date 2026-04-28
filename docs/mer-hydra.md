# MER — Sistema Hydra (CEA Querétaro)

> Generado: 2026-04-27  
> Base de datos: `hydra` (PostgreSQL 35.188.238.10:5433)

---

## Diagrama Entidad-Relación (Mermaid)

El esquema se agrupa en 10 dominios. Para legibilidad, el ERD completo se divide por dominio.

---

### 1. Flujo Principal: Solicitud → Contrato

```mermaid
erDiagram
    Solicitud {
        string id PK
        string folio UK
        string estado
        json formData
        string contratoId FK
        string adminId FK
        string tipoContratacionId FK
    }
    SolicitudInspeccion {
        string id PK
        string solicitudId FK
        string estado
        string diametroToma
        string materialCalle
        string materialBanqueta
        string metrosRupturaAguaCalle
        string metrosRupturaDrenajeCalle
    }
    ProcesoContratacion {
        string id PK
        string contratoId FK
        string tramiteId FK
        string etapa
        string estado
        string plantillaId FK
    }
    HitoContratacion {
        string id PK
        string procesoId FK
        string etapa
        string estado
    }
    PlantillaContrato {
        string id PK
        string nombre
        string contenido
    }
    Contrato {
        string id PK
        int numeroContrato UK
        string tipoContratacionId FK
        string puntoServicioId FK
        string tomaId FK
        string domicilioId FK
        string zonaId FK
        string rutaId FK
        string estado
        json variablesCapturadas
    }

    Solicitud ||--o| SolicitudInspeccion : "tiene"
    Solicitud ||--o{ ProcesoContratacion : "genera (via contratoId)"
    Contrato ||--o{ ProcesoContratacion : "tiene"
    ProcesoContratacion ||--o{ HitoContratacion : "registra"
    ProcesoContratacion }o--o| PlantillaContrato : "usa"
```

---

### 2. Tipos de Contratación y Catálogos del Contrato

```mermaid
erDiagram
    TipoContratacion {
        string id PK
        string codigo UK
        string nombre
        bool requiereMedidor
        bool requiereInspeccion
        bool esIndividualizacion
        string claseProceso
        string administracionId FK
        string claseContratoId FK
    }
    VariableTipoContratacion {
        string id PK
        string tipoContratacionId FK
        string tipoVariableId FK
        bool obligatorio
        int orden
    }
    TipoVariable {
        string id PK
        string codigo UK
        string nombre
        string tipoDato
        json valoresPosibles
    }
    ConceptoCobro {
        string id PK
        string codigo UK
        string nombre
        string tipo
        string origen
        decimal montoBase
        decimal ivaPct
        string formula
        json variablesFormula
    }
    ConceptoCobroTipoContratacion {
        string id PK
        string tipoContratacionId FK
        string conceptoCobroId FK
        bool obligatorio
        int orden
    }
    ClausulaContractual {
        string id PK
        string codigo UK
        string titulo
        string contenido
    }
    ClausulaTipoContratacion {
        string id PK
        string tipoContratacionId FK
        string clausulaId FK
        int orden
    }
    DocumentoRequeridoTipoContratacion {
        string id PK
        string tipoContratacionId FK
        string nombreDocumento
        bool obligatorio
    }
    ClaseContrato {
        string id PK
        string codigo UK
        string descripcion
    }
    ContratoConcepto {
        string id PK
        string contratoId FK
        string conceptoCobroId FK
        decimal cantidad
        decimal precioBase
        decimal importe
        decimal ivaPct
    }

    TipoContratacion ||--o{ VariableTipoContratacion : "define"
    TipoVariable ||--o{ VariableTipoContratacion : "asignada en"
    TipoContratacion ||--o{ ConceptoCobroTipoContratacion : "incluye"
    ConceptoCobro ||--o{ ConceptoCobroTipoContratacion : "incluido en"
    TipoContratacion ||--o{ ClausulaTipoContratacion : "tiene"
    ClausulaContractual ||--o{ ClausulaTipoContratacion : "usada en"
    TipoContratacion ||--o{ DocumentoRequeridoTipoContratacion : "requiere"
    TipoContratacion }o--o| ClaseContrato : "clase"
    Contrato ||--o{ ContratoConcepto : "tiene"
    ConceptoCobro ||--o{ ContratoConcepto : "referencia"
```

---

### 3. Motor Tarifario

```mermaid
erDiagram
    Tarifa {
        string id PK
        string codigo
        string nombre
        string tipoServicio
        string tipoCalculo
        string administracionId FK
        string tipoContratacionCodigo
        int rangoMinM3
        int rangoMaxM3
        decimal precioUnitario
        decimal cuotaFija
        decimal ivaPct
        datetime vigenciaDesde
        datetime vigenciaHasta
        bool activo
    }
    CorreccionTarifaria {
        string id PK
        string tarifaId FK
        string tipo
        decimal porcentaje
        decimal montoFijo
        json condiciones
    }
    AjusteTarifario {
        string id PK
        string contratoId FK
        string periodo
        string tipo
        decimal montoOriginal
        decimal montoAjustado
        string motivo
    }
    ActualizacionTarifaria {
        string id PK
        string descripcion
        datetime fechaPublicacion
        datetime fechaAplicacion
        string estado
        json tarifasAfectadas
    }

    Tarifa ||--o{ CorreccionTarifaria : "tiene"
    Contrato ||--o{ AjusteTarifario : "recibe"
```

> **Nota:** `Tarifa` se filtra en runtime por `tipoServicio` + `tipoContratacionCodigo` + `administracionId` + rango de vigencia. No hay FK directa hacia `TipoContratacion` — el join es por `codigo` string.

---

### 4. Medición y Facturación

```mermaid
erDiagram
    LoteLecturas {
        string id PK
        string zonaId FK
        string rutaId FK
        string periodo
        string tipoLote
        string estado
    }
    Lectura {
        string id PK
        string loteId FK
        string contratoId FK
        string lecturistaId FK
        string incidenciaId FK
        string periodo
        int lecturaActual
        int lecturaAnterior
        int consumoReal
        string estado
    }
    Consumo {
        string id PK
        string contratoId FK
        string periodo
        decimal m3
        string tipo
        bool confirmado
    }
    Timbrado {
        string id PK
        string contratoId FK
        string consumoId FK
        string uuid
        string estado
        string periodo
        decimal subtotal
        decimal iva
        decimal total
    }
    Recibo {
        string id PK
        string contratoId FK
        string timbradoId FK
        decimal saldoVigente
        decimal saldoVencido
        string fechaVencimiento
    }
    Pago {
        string id PK
        string contratoId FK
        string reciboId FK
        string timbradoId FK
        string convenioId FK
        string formaPagoId FK
        decimal monto
        string fecha
        string tipo
    }
    Convenio {
        string id PK
        string contratoId FK
        int numParcialidades
        decimal montoTotal
        decimal montoPagado
        string estado
    }
    Anticipo {
        string id PK
        string contratoId FK
        string sesionId FK
        decimal monto
        bool aplicado
    }
    CostoContrato {
        string id PK
        string contratoId FK
        string concepto
        decimal monto
    }

    LoteLecturas ||--o{ Lectura : "contiene"
    Contrato ||--o{ Lectura : "tiene"
    Contrato ||--o{ Consumo : "genera"
    Consumo ||--o| Timbrado : "timbra"
    Contrato ||--o{ Timbrado : "tiene"
    Timbrado ||--o{ Recibo : "genera"
    Recibo ||--o{ Pago : "cobra"
    Contrato ||--o{ Pago : "recibe"
    Contrato ||--o{ Convenio : "tiene"
    Convenio ||--o{ Pago : "parcializa"
    Contrato ||--o{ Anticipo : "tiene"
    Contrato ||--o{ CostoContrato : "tiene"
```

---

### 5. Infraestructura Física

```mermaid
erDiagram
    PuntoServicio {
        string id PK
        string codigo UK
        string domicilioId FK
        string tipoSuministroId FK
        string estructuraTecnicaId FK
        string zonaFacturacionId FK
        string codigoRecorridoId FK
        string tipoRelacionPadreId FK
        string puntoServicioPadreId FK
        decimal reparticionConsumo
        string estado
        bool cortable
    }
    Toma {
        string id PK
        string construccionId FK
        string tipo
        string estado
    }
    Construccion {
        string id PK
        string factibilidadId FK
        string nombre
        string estado
    }
    Factibilidad {
        string id PK
        string predio
        string estado
    }
    Medidor {
        string id PK
        string contratoId FK
        string serie
        string estado
        string marcaId FK
        string modeloId FK
        string calibreId FK
    }
    MedidorBodega {
        string id PK
        string serie
        string zonaId FK
        string estado
        string marcaId FK
        string modeloId FK
        string calibreId FK
    }
    Ruta {
        string id PK
        string zonaId FK
        string distritoId FK
        string sector
        string libreta
        string lecturista
    }

    PuntoServicio ||--o| PuntoServicio : "padre-hijo"
    PuntoServicio }o--o| Domicilio : "ubicado en"
    Factibilidad ||--o{ Construccion : "tiene"
    Construccion ||--o{ Toma : "genera"
    Contrato }o--o| Toma : "usa"
    Contrato }o--o| PuntoServicio : "asignado a"
    Contrato ||--o| Medidor : "instala"
    Contrato }o--o| Ruta : "pertenece a"
```

---

### 6. Personas y Domicilios

```mermaid
erDiagram
    Persona {
        string id PK
        string nombre
        string apellidoPaterno
        string apellidoMaterno
        string rfc
        string curp
        string tipo
        string email
        string telefono
    }
    RolPersonaContrato {
        string id PK
        string personaId FK
        string contratoId FK
        string rol
        bool activo
    }
    DomicilioPersona {
        string id PK
        string personaId FK
        string domicilioId FK
        string tipo
        bool principal
    }
    Domicilio {
        string id PK
        string calle
        string numExterior
        string codigoPostal
        string coloniaINEGIId FK
        string localidadINEGIId FK
        string municipioINEGIId FK
        string estadoINEGIId FK
        bool validadoINEGI
    }

    Persona ||--o{ RolPersonaContrato : "juega rol en"
    Contrato ||--o{ RolPersonaContrato : "tiene personas"
    Persona ||--o{ DomicilioPersona : "tiene"
    Domicilio ||--o{ DomicilioPersona : "usado por"
    Domicilio }o--o| CatalogoColoniaINEGI : "colonia"
    Domicilio }o--o| CatalogoLocalidadINEGI : "localidad"
    Domicilio }o--o| CatalogoMunicipioINEGI : "municipio"
    Domicilio }o--o| CatalogoEstadoINEGI : "estado"
```

---

### 7. Catálogos Territoriales (Aquasis / INEGI)

```mermaid
erDiagram
    CatalogoEstadoINEGI {
        string id PK
        string claveINEGI UK
        string nombre
    }
    CatalogoMunicipioINEGI {
        string id PK
        string estadoId FK
        string claveINEGI UK
        string nombre
    }
    CatalogoLocalidadINEGI {
        string id PK
        string municipioId FK
        int aquasisPobid UK
        string nombre
    }
    CatalogoColoniaINEGI {
        string id PK
        string localidadId FK
        int aquasisBarrId UK
        string nombre
        string tipo
    }

    CatalogoEstadoINEGI ||--o{ CatalogoMunicipioINEGI : "tiene"
    CatalogoMunicipioINEGI ||--o{ CatalogoLocalidadINEGI : "tiene"
    CatalogoLocalidadINEGI ||--o{ CatalogoColoniaINEGI : "tiene"
```

> **Fuente de datos:** Aquasis (CEA Querétaro)  
> - `aquasisPobid` → ID de pobproid en tabla Localidad Población de Aquasis (filtro 1-18 municipios QRO)  
> - `aquasisBarrId` → barrId de tabla Colonia Barrio de Aquasis  
> - Relación colonia→localidad colapsa la tabla intermedia Localidad; `localidadId` apunta directo a `aquasisPobid`

---

### 8. Territorial Operativo

```mermaid
erDiagram
    Administracion {
        string id PK
        string nombre
    }
    Zona {
        string id PK
        string administracionId FK
        string nombre
    }
    Distrito {
        string id PK
        string zonaId FK
        string nombre
    }
    SectorHidraulico {
        string id PK
        string codigo UK
        string nombre
        string administracionId FK
    }
    Oficina {
        string id PK
        string codigo UK
        string nombre
        string administracionId FK
        string tipoOficinaId FK
    }
    TipoOficina {
        string id PK
        string codigo UK
        string descripcion
    }

    Administracion ||--o{ Zona : "tiene"
    Zona ||--o{ Distrito : "tiene"
    Administracion ||--o{ SectorHidraulico : "tiene"
    Administracion ||--o{ Oficina : "tiene"
    TipoOficina ||--o{ Oficina : "clasifica"
```

---

### 9. Catálogos de Medidores

```mermaid
erDiagram
    CatalogoMarcaMedidor {
        string id PK
        string codigo UK
        string nombre
    }
    CatalogoModeloMedidor {
        string id PK
        string marcaId FK
        string codigo UK
        string nombre
    }
    CatalogoCalibre {
        string id PK
        string codigo UK
        string descripcion
        decimal diametroMm
    }
    CatalogoEmplazamiento {
        string id PK
        string codigo UK
        string descripcion
    }
    CatalogoTipoContador {
        string id PK
        string codigo UK
        string descripcion
    }

    CatalogoMarcaMedidor ||--o{ CatalogoModeloMedidor : "tiene modelos"
    CatalogoMarcaMedidor ||--o{ Medidor : "usada en"
    CatalogoModeloMedidor ||--o{ Medidor : "usada en"
    CatalogoCalibre ||--o{ Medidor : "usada en"
```

---

### 10. Operaciones, Trámites y Otros

```mermaid
erDiagram
    Tramite {
        string id PK
        string folio UK
        string contratoId FK
        string personaId FK
        string tipo
        string estado
    }
    Orden {
        string id PK
        string contratoId FK
        string tipo
        string subtipoCorteId FK
        string estado
        string prioridad
    }
    QuejaAclaracion {
        string id PK
        string contratoId FK
        string tipo
        string estado
    }
    SigeHydra {
        string id PK
        string cnttnum UK
        string contratoId FK
    }
    Poliza {
        string id PK
        string numero UK
        string tipo
        string periodo
        string estado
    }
    LineaPoliza {
        string id PK
        string polizaId FK
        decimal monto
        string cuentaContable
    }
    SesionCaja {
        string id PK
        string usuarioId FK
        decimal montoInicial
        decimal totalCobrado
        string estado
    }
    Lecturista {
        string id PK
        string codigo UK
        string nombre
        string contratistaId FK
    }
    Contratista {
        string id PK
        string nombre
    }

    Contrato ||--o{ Tramite : "tiene"
    Contrato ||--o{ Orden : "genera"
    Contrato ||--o{ QuejaAclaracion : "tiene"
    Contrato ||--o| SigeHydra : "referencia SIGE"
    Poliza ||--o{ LineaPoliza : "tiene"
    SesionCaja ||--o{ Anticipo : "registra"
    Contratista ||--o{ Lecturista : "tiene"
    Lecturista ||--o{ Lectura : "captura"
```

---

## Resumen de Modelos por Dominio

| Dominio | Modelos |
|---------|---------|
| **Flujo solicitud→contrato** | Solicitud, SolicitudInspeccion, ProcesoContratacion, HitoContratacion, PlantillaContrato |
| **Contrato** | Contrato, CostoContrato, ContratoConcepto, HistoricoContrato |
| **Tipos contratación** | TipoContratacion, TipoVariable, VariableTipoContratacion, ConceptoCobro, ConceptoCobroTipoContratacion, ClausulaContractual, ClausulaTipoContratacion, DocumentoRequeridoTipoContratacion, ClaseContrato |
| **Motor tarifario** | Tarifa, CorreccionTarifaria, AjusteTarifario, ActualizacionTarifaria |
| **Medición / Facturación** | LoteLecturas, Lectura, Consumo, Timbrado, Recibo, Pago, Convenio, Anticipo |
| **Infraestructura** | PuntoServicio, Toma, Construccion, Factibilidad, Medidor, MedidorBodega, Ruta |
| **Personas / Domicilios** | Persona, RolPersonaContrato, DomicilioPersona, Domicilio |
| **Catálogos Aquasis/INEGI** | CatalogoEstadoINEGI, CatalogoMunicipioINEGI, CatalogoLocalidadINEGI, CatalogoColoniaINEGI |
| **Territorial operativo** | Administracion, Zona, Distrito, SectorHidraulico, Oficina, TipoOficina |
| **Catálogos medidores** | CatalogoMarcaMedidor, CatalogoModeloMedidor, CatalogoCalibre, CatalogoEmplazamiento, CatalogoTipoContador |
| **Catálogos PS** | CatalogoTipoSuministro, CatalogoEstructuraTecnica, CatalogoZonaFacturacion, CatalogoCodigoRecorrido, CatalogoTipoRelacionPS, CatalogoTipoCorte |
| **Catálogos contrato** | CatalogoActividad, CatalogoGrupoActividad, CatalogoCategoria, CatalogoSat, FormaPago |
| **Trámites / docs** | Tramite, SeguimientoTramite, Documento, CatalogoTramite |
| **Operaciones** | Orden, SeguimientoOrden, QuejaAclaracion, SeguimientoQueja |
| **Caja / pagos externos** | SesionCaja, PagoExterno |
| **SAP / Contabilidad** | ReglaContable, Poliza, LineaPoliza |
| **GIS / Monitoreo** | LogSincronizacion, CambioGIS, LogProceso, ConciliacionReporte |
| **Lecturistas** | Contratista, Lecturista, CatalogoIncidencia, MensajeLecturista |
| **Auth / integración** | User, SigeHydra, AgoraTicket, MensajeRecibo |

---

## Relaciones Clave del Contrato

El modelo `Contrato` es el hub central. Sus FKs principales:

```
Contrato
├── tipoContratacionId → TipoContratacion
├── puntoServicioId    → PuntoServicio
├── tomaId             → Toma
├── domicilioId        → Domicilio
├── zonaId             → Zona
├── rutaId             → Ruta
├── actividadId        → CatalogoActividad
├── categoriaId        → CatalogoCategoria
│
├── [1:1] medidor       → Medidor
├── [1:N] personas      → RolPersonaContrato → Persona
├── [1:N] consumos      → Consumo → Timbrado → Recibo → Pago
├── [1:N] ordenes       → Orden
├── [1:N] tramites      → Tramite
├── [1:N] convenios     → Convenio
├── [1:N] conceptos     → ContratoConcepto → ConceptoCobro
└── [1:N] procesos      → ProcesoContratacion → HitoContratacion
```

## Motor Tarifario — Notas

`Tarifa` **no** tiene FK directa a `TipoContratacion`. El join es dinámico en runtime vía:
- `tarifas.tipo_contratacion_codigo` = `tipos_contratacion.codigo`
- `tarifas.administracion_id` (opcional)
- `tarifas.vigencia_desde / vigencia_hasta` (fecha efectiva)
- `tarifas.rango_min_m3 / rango_max_m3` (para escalonado)

Para cotizaciones, el motor en `lib/tarifas.ts` (`calcularCotizacion`) también lee los `ConceptoCobro` con `formula` y `variablesFormula` para calcular montos de instalación basados en variables capturadas (METROS_TOMA, DIAMETRO_TOMA, etc.).
