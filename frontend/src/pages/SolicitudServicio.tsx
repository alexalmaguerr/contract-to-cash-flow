import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import DomicilioPickerForm from '@/components/contratacion/DomicilioPickerForm';
import { TIPOS_CONTRATACION_BY_ADMIN } from '@/config/tipos-contratacion';
import { cn } from '@/lib/utils';
import type { SolicitudState } from '@/types/solicitudes';
import { SOLICITUD_STATE_EMPTY } from '@/types/solicitudes';
import { useSolicitudesStore } from '@/hooks/useSolicitudesStore';

// ── Catálogos hardcoded ──────────────────────────────────────────────────────

const ADMINISTRACIONES: Record<string, string> = {
  '1': 'QUERÉTARO',
  '2': 'SANTA ROSA JÁUREGUI',
  '3': 'CORREGIDORA',
  '4': 'PEDRO ESCOBEDO',
  '5': 'TEQUISQUIAPAN',
  '6': 'EZEQUIEL MONTES',
  '7': 'AMEALCO DE BONFIL',
  '8': 'HUIMILPAN',
  '9': 'CADEREYTA DE MONTES-SAN JOAQUÍN',
  '10': 'COLÓN-TOLIMÁN',
  '11': 'JALPAN DE SERRA-LANDA DE MATAMOROS-ARROYO SECO',
  '12': 'EL MARQUÉS',
  '13': 'PINAL DE AMOLES-PEÑAMILLER',
};

const REGIMENES_FISCALES = [
  { id: '601', nombre: 'General de Ley Personas Morales' },
  { id: '603', nombre: 'Personas Morales con Fines no Lucrativos' },
  { id: '605', nombre: 'Sueldos y Salarios e Ingresos Asimilados' },
  { id: '606', nombre: 'Arrendamiento' },
  { id: '612', nombre: 'Personas Físicas con Actividades Empresariales' },
  { id: '616', nombre: 'Sin obligaciones fiscales' },
  { id: '621', nombre: 'Incorporación Fiscal' },
  { id: '622', nombre: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { id: '626', nombre: 'Régimen Simplificado de Confianza' },
];

const USOS_CFDI = [
  { id: 'G01', nombre: 'Adquisición de mercancias' },
  { id: 'G03', nombre: 'Gastos en general' },
  { id: 'I01', nombre: 'Construcciones' },
  { id: 'S01', nombre: 'Sin efectos fiscales' },
  { id: 'CP01', nombre: 'Pagos' },
  { id: 'CN01', nombre: 'Nómina' },
];

// ── Shared UI helpers ────────────────────────────────────────────────────────

function YesNo({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: 'si' | 'no' | '';
  onChange: (v: 'si' | 'no') => void;
  disabled?: boolean;
}) {
  return (
    <RadioGroup
      id={id}
      value={value}
      onValueChange={(v) => onChange(v as 'si' | 'no')}
      className="flex flex-row gap-0"
      disabled={disabled}
    >
      {(['si', 'no'] as const).map((opt) => (
        <Label
          key={opt}
          htmlFor={`${id}-${opt}`}
          className={cn(
            'flex cursor-pointer items-center gap-1.5 border px-3.5 py-1.5 text-sm font-medium transition-colors select-none',
            opt === 'si' ? 'rounded-l-md border-r-0' : 'rounded-r-md',
            value === opt
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-input hover:bg-accent',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <RadioGroupItem id={`${id}-${opt}`} value={opt} className="sr-only" />
          {opt === 'si' ? 'Sí' : 'No'}
        </Label>
      ))}
    </RadioGroup>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SectionTitle({ letter, title }: { letter: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {letter}
      </span>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SolicitudServicio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useSolicitudesStore();

  const isEditMode = !!id;
  const existingRecord = isEditMode ? store.getById(id) : undefined;

  const [form, setForm] = useState<SolicitudState>(
    existingRecord?.formData ?? SOLICITUD_STATE_EMPTY,
  );

  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });

  function set(patch: Partial<SolicitudState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const tiposList = form.adminId ? (TIPOS_CONTRATACION_BY_ADMIN[form.adminId] ?? []) : [];
  const selectedTipo = tiposList.find((t) => t.id === form.tipoContratacionId);

  function copiarDatosPropietario() {
    set({
      fiscalTipoPersona: form.propTipoPersona,
      fiscalRazonSocial: form.propRazonSocial,
      fiscalRfc: form.propRfc,
      fiscalCorreo: form.propCorreo,
      fiscalDir: { ...form.propDir },
    });
  }

  function handleGuardar() {
    if (isEditMode && id) {
      store.updateFormData(id, form);
      toast.success('Solicitud actualizada');
    } else {
      const record = store.create(form);
      toast.success(`Solicitud ${record.folio} guardada`);
    }
    navigate('/app/solicitudes');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => navigate('/app/solicitudes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">
            {isEditMode && existingRecord
              ? `Editar solicitud — ${existingRecord.folio}`
              : 'CEA-FUS01 — Nueva Solicitud de Servicios'}
          </h1>
          <p className="text-xs text-muted-foreground">Los campos con * son obligatorios. Llenar lo que corresponda.</p>
        </div>
      </div>

      {/* ── Meta header ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
          <Field label="Clave catastral del predio">
            <Input
              className="h-9"
              placeholder="Ej. 22001-001-001"
              value={form.claveCatastral}
              onChange={(e) => set({ claveCatastral: e.target.value })}
            />
          </Field>
          <Field label="Fecha de solicitud">
            <Input className="h-9 bg-muted/40" value={today} readOnly />
          </Field>
          <Field label="Folio de expediente (solo factibilidades)">
            <Input
              className="h-9"
              placeholder="Folio expediente"
              value={form.folioExpediente}
              onChange={(e) => set({ folioExpediente: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── A. Predio ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <SectionTitle letter="A" title="Predio donde se requerirán los servicios" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DomicilioPickerForm
            value={form.predioDir}
            onChange={(v) => set({ predioDir: v })}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Manzana">
              <Input className="h-9" placeholder="MZ" value={form.predioManzana} onChange={(e) => set({ predioManzana: e.target.value })} />
            </Field>
            <Field label="Lote">
              <Input className="h-9" placeholder="LT" value={form.predioLote} onChange={(e) => set({ predioLote: e.target.value })} />
            </Field>
            <Field label="Superficie total (m²)">
              <Input className="h-9" type="number" min="0" placeholder="0.00" value={form.superficieTotal} onChange={(e) => set({ superficieTotal: e.target.value })} />
            </Field>
            <Field label="Superficie construida (m²)">
              <Input className="h-9" type="number" min="0" placeholder="0.00" value={form.superficieConstruida} onChange={(e) => set({ superficieConstruida: e.target.value })} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── B. Propietario ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <SectionTitle letter="B" title="Datos del propietario" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tipo de persona <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={form.propTipoPersona}
              onValueChange={(v) => set({ propTipoPersona: v as 'fisica' | 'moral', propPaterno: '', propMaterno: '', propNombre: '', propRazonSocial: '' })}
              className="flex flex-row gap-0"
            >
              {(['fisica', 'moral'] as const).map((opt) => (
                <Label
                  key={opt}
                  htmlFor={`prop-tipo-${opt}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-1.5 border px-4 py-1.5 text-sm font-medium transition-colors select-none capitalize',
                    opt === 'fisica' ? 'rounded-l-md border-r-0' : 'rounded-r-md',
                    form.propTipoPersona === opt
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-accent',
                  )}
                >
                  <RadioGroupItem id={`prop-tipo-${opt}`} value={opt} className="sr-only" />
                  {opt === 'fisica' ? 'Física' : 'Moral'}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {form.propTipoPersona === 'moral' ? (
            <Field label="Razón social" required>
              <Input className="h-9" value={form.propRazonSocial} onChange={(e) => set({ propRazonSocial: e.target.value })} />
            </Field>
          ) : form.propTipoPersona === 'fisica' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Apellido paterno" required>
                <Input className="h-9" value={form.propPaterno} onChange={(e) => set({ propPaterno: e.target.value })} />
              </Field>
              <Field label="Apellido materno">
                <Input className="h-9" value={form.propMaterno} onChange={(e) => set({ propMaterno: e.target.value })} />
              </Field>
              <Field label="Nombre(s)" required>
                <Input className="h-9" value={form.propNombre} onChange={(e) => set({ propNombre: e.target.value })} />
              </Field>
            </div>
          ) : null}

          {form.propTipoPersona ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="RFC">
                  <Input className="h-9 font-mono text-xs" placeholder="XXXX000000XX0" value={form.propRfc} onChange={(e) => set({ propRfc: e.target.value.toUpperCase() })} maxLength={13} />
                </Field>
                <Field label="Correo electrónico" required>
                  <Input className="h-9" type="email" value={form.propCorreo} onChange={(e) => set({ propCorreo: e.target.value })} />
                </Field>
                <Field label="Teléfono" required>
                  <Input className="h-9" type="tel" value={form.propTelefono} onChange={(e) => set({ propTelefono: e.target.value })} />
                </Field>
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domicilio del propietario</p>
              <DomicilioPickerForm value={form.propDir} onChange={(v) => set({ propDir: v })} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Manzana">
                  <Input className="h-9" value={form.propManzana} onChange={(e) => set({ propManzana: e.target.value })} />
                </Field>
                <Field label="Lote">
                  <Input className="h-9" value={form.propLote} onChange={(e) => set({ propLote: e.target.value })} />
                </Field>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* ── C. Tipo de solicitud ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <SectionTitle letter="C" title="Tipo de solicitud" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              1. ¿Uso que desea contratar? <span className="text-destructive">*</span>
            </p>
            <RadioGroup
              value={form.usoDomestico}
              onValueChange={(v) => set({ usoDomestico: v as 'si' | 'no', hayInfraCEA: '', esCondominio: '', condoViviendas: '', condoUbicacionTomas: '', condoTieneMedidorMacro: '', condoNumMedidor: '', condoAreasComunes: '', condoNumAreas: '', condoAgrupacion: '', condoNombreAgrupacion: '', personasVivienda: '' })}
              className="flex flex-wrap gap-2"
            >
              {([['si', 'Doméstico'], ['no', 'No Doméstico']] as const).map(([val, lbl]) => (
                <Label
                  key={val}
                  htmlFor={`uso-${val}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-1.5 rounded-md border px-4 py-1.5 text-sm font-medium transition-colors select-none',
                    form.usoDomestico === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent',
                  )}
                >
                  <RadioGroupItem id={`uso-${val}`} value={val} className="sr-only" />
                  {lbl}
                  {val === 'no' && <span className="ml-1 text-xs font-normal opacity-70">(comercial, industrial, otros)</span>}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              2. ¿En el predio hay instalaciones de tuberías para conectar toma(s) y colocar medidor(es)? <span className="text-destructive">*</span>
            </p>
            <YesNo id="hay-tuberias" value={form.hayTuberias} onChange={(v) => set({ hayTuberias: v })} />
          </div>

          {form.usoDomestico === 'si' && (
            <div className="ml-4 space-y-5 border-l-2 border-primary/20 pl-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Uso doméstico</p>

              <div className="space-y-2">
                <p className="text-sm font-medium">1. ¿En la colonia o desarrollo existe infraestructura de agua operada por la CEA?</p>
                <YesNo id="hay-infra-cea" value={form.hayInfraCEA} onChange={(v) => set({ hayInfraCEA: v })} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">2. La colonia o desarrollo ¿es un condominio?</p>
                <YesNo
                  id="es-condominio"
                  value={form.esCondominio}
                  onChange={(v) => set({ esCondominio: v, condoViviendas: '', condoUbicacionTomas: '', condoTieneMedidorMacro: '', condoNumMedidor: '', condoAreasComunes: '', condoNumAreas: '', condoAgrupacion: '', condoNombreAgrupacion: '', personasVivienda: '' })}
                />

                {form.esCondominio === 'si' && (
                  <div className="ml-4 mt-3 space-y-4 border-l border-muted-foreground/20 pl-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">a. ¿Cuántas viviendas / unidades privativas se desea contratar? <span className="text-xs text-muted-foreground">(Trámite individualización)</span></Label>
                      <Input className="h-9 max-w-xs" type="number" min="1" placeholder="Núm. unidades" value={form.condoViviendas} onChange={(e) => set({ condoViviendas: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">a.1 ¿Dónde se encuentran ubicadas las tomas?</p>
                      <RadioGroup
                        value={form.condoUbicacionTomas}
                        onValueChange={(v) => set({ condoUbicacionTomas: v as 'banqueta' | 'cuadro' })}
                        className="flex flex-row gap-0"
                      >
                        {([['banqueta', 'En la banqueta'], ['cuadro', 'Hay cuadro para instalar medidor']] as const).map(([val, lbl]) => (
                          <Label
                            key={val}
                            htmlFor={`tomas-${val}`}
                            className={cn(
                              'flex cursor-pointer items-center gap-1.5 border px-3.5 py-1.5 text-sm font-medium transition-colors select-none',
                              val === 'banqueta' ? 'rounded-l-md border-r-0' : 'rounded-r-md',
                              form.condoUbicacionTomas === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent',
                            )}
                          >
                            <RadioGroupItem id={`tomas-${val}`} value={val} className="sr-only" />
                            {lbl}
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">b. ¿El condominio o desarrollo cuenta actualmente con medidor (macro)?</p>
                      <YesNo id="condo-medidor" value={form.condoTieneMedidorMacro} onChange={(v) => set({ condoTieneMedidorMacro: v, condoNumMedidor: '' })} />
                      {form.condoTieneMedidorMacro === 'si' && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Número de medidor</Label>
                          <Input className="h-9 max-w-xs" placeholder="Núm. medidor" value={form.condoNumMedidor} onChange={(e) => set({ condoNumMedidor: e.target.value })} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">c. ¿Se pretende contratar servicio para áreas comunes? <span className="text-xs text-muted-foreground">(Excepto áreas verdes)</span></p>
                      <YesNo id="condo-areas" value={form.condoAreasComunes} onChange={(v) => set({ condoAreasComunes: v, condoNumAreas: '' })} />
                      {form.condoAreasComunes === 'si' && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">¿Cuántas áreas?</Label>
                          <Input className="h-9 max-w-xs" type="number" min="1" placeholder="Núm. áreas" value={form.condoNumAreas} onChange={(e) => set({ condoNumAreas: e.target.value })} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">d. ¿Existe una agrupación formal de colonos o condominios? <span className="text-destructive">*</span></p>
                      <YesNo id="condo-agrupacion" value={form.condoAgrupacion} onChange={(v) => set({ condoAgrupacion: v, condoNombreAgrupacion: '' })} />
                      {form.condoAgrupacion === 'si' && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Nombre de la agrupación <span className="text-destructive">*</span></Label>
                          <Input className="h-9 max-w-sm" placeholder="Nombre" value={form.condoNombreAgrupacion} onChange={(e) => set({ condoNombreAgrupacion: e.target.value })} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {form.esCondominio === 'no' && (
                  <div className="ml-4 mt-3 space-y-1 border-l border-muted-foreground/20 pl-4">
                    <Label className="text-sm">a. ¿Cuántas personas habitarán la vivienda?</Label>
                    <Input className="h-9 max-w-xs" type="number" min="1" placeholder="Núm. personas" value={form.personasVivienda} onChange={(e) => set({ personasVivienda: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  3. ¿Cuenta con certificado de conexión?{' '}
                  <span className="font-normal text-muted-foreground">(Documento que avala que el desarrollo cuenta con infraestructura para servicios de agua y está entregado a la CEA y/o municipio)</span>
                </p>
                <YesNo id="cert-conexion" value={form.tieneCertConexion} onChange={(v) => set({ tieneCertConexion: v })} />
              </div>
            </div>
          )}

          {form.usoDomestico === 'no' && (
            <div className="rounded-md border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Para uso no doméstico (comercial, industrial, etc.) continúe con las siguientes secciones.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── D. Tipo de contratación ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <SectionTitle letter="D" title="Tipo de contratación" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Administración" required>
              <Select value={form.adminId} onValueChange={(v) => set({ adminId: v, tipoContratacionId: '' })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccione administración…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADMINISTRACIONES).map(([id, nombre]) => (
                    <SelectItem key={id} value={id}>{nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tipo de contratación" required>
              <Select
                value={form.tipoContratacionId}
                onValueChange={(v) => set({ tipoContratacionId: v })}
                disabled={!form.adminId || tiposList.length === 0}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={form.adminId ? 'Seleccione tipo…' : 'Primero seleccione administración'} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {tiposList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.descripcion}
                      <span className="ml-1.5 font-mono text-xs text-muted-foreground">({t.id})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Contrato padre (individualizaciones)">
            <Input className="h-9" placeholder="Folio o número de contrato padre" value={form.contratoPadre} onChange={(e) => set({ contratoPadre: e.target.value })} />
          </Field>

          {selectedTipo && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo seleccionado</p>
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span className="font-medium">{selectedTipo.descripcion}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">({selectedTipo.id})</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── E. Datos fiscales ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <SectionTitle letter="E" title="Datos fiscales" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">¿Requiere facturar? <span className="text-destructive">*</span></p>
            <YesNo id="requiere-factura" value={form.requiereFactura} onChange={(v) => set({ requiereFactura: v, mismosDatosProp: '' })} />
          </div>

          {form.requiereFactura === 'si' && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  ¿La factura y dirección fiscal serán los mismos que los del propietario?{' '}
                  <span className="text-xs font-normal text-muted-foreground">(Sección B)</span>
                </p>
                <div className="flex items-center gap-3">
                  <YesNo
                    id="mismos-datos-prop"
                    value={form.mismosDatosProp}
                    onChange={(v) => {
                      set({ mismosDatosProp: v });
                      if (v === 'si') copiarDatosPropietario();
                    }}
                  />
                  {form.mismosDatosProp === 'no' && (
                    <Button type="button" variant="outline" size="sm" onClick={copiarDatosPropietario}>
                      Copiar datos del propietario
                    </Button>
                  )}
                </div>
              </div>

              {(form.mismosDatosProp === 'no' || form.mismosDatosProp === 'si') && (
                <div className="space-y-4">
                  {form.mismosDatosProp === 'no' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo de persona <span className="text-destructive">*</span></Label>
                        <RadioGroup
                          value={form.fiscalTipoPersona}
                          onValueChange={(v) => set({ fiscalTipoPersona: v as 'fisica' | 'moral' })}
                          className="flex flex-row gap-0"
                        >
                          {(['fisica', 'moral'] as const).map((opt) => (
                            <Label
                              key={opt}
                              htmlFor={`fiscal-tipo-${opt}`}
                              className={cn(
                                'flex cursor-pointer items-center gap-1.5 border px-4 py-1.5 text-sm font-medium transition-colors select-none',
                                opt === 'fisica' ? 'rounded-l-md border-r-0' : 'rounded-r-md',
                                form.fiscalTipoPersona === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent',
                              )}
                            >
                              <RadioGroupItem id={`fiscal-tipo-${opt}`} value={opt} className="sr-only" />
                              {opt === 'fisica' ? 'Física' : 'Moral'}
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>

                      {form.fiscalTipoPersona === 'moral' && (
                        <Field label="Razón social" required>
                          <Input className="h-9" value={form.fiscalRazonSocial} onChange={(e) => set({ fiscalRazonSocial: e.target.value })} />
                        </Field>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="RFC para facturación" required>
                          <Input className="h-9 font-mono text-xs" placeholder="XXXX000000XX0" value={form.fiscalRfc} onChange={(e) => set({ fiscalRfc: e.target.value.toUpperCase() })} maxLength={13} />
                        </Field>
                        <Field label="Correo electrónico" required>
                          <Input className="h-9" type="email" value={form.fiscalCorreo} onChange={(e) => set({ fiscalCorreo: e.target.value })} />
                        </Field>
                      </div>

                      <Separator />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domicilio fiscal</p>
                      <DomicilioPickerForm value={form.fiscalDir} onChange={(v) => set({ fiscalDir: v })} />
                    </>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Régimen fiscal" required>
                      <Select value={form.fiscalRegimenFiscal} onValueChange={(v) => set({ fiscalRegimenFiscal: v })}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccione régimen…" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIMENES_FISCALES.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                              <span className="ml-2">{r.nombre}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Uso del CFDI" required>
                      <Select value={form.fiscalUsoCfdi} onValueChange={(v) => set({ fiscalUsoCfdi: v })}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccione uso…" />
                        </SelectTrigger>
                        <SelectContent>
                          {USOS_CFDI.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <span className="font-mono text-xs text-muted-foreground">{u.id}</span>
                              <span className="ml-2">{u.nombre}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={() => navigate('/app/solicitudes')}>
          Cancelar
        </Button>
        <Button type="button" className="bg-[#007BFF] hover:bg-blue-600 text-white" onClick={handleGuardar}>
          {isEditMode ? 'Guardar cambios' : 'Guardar solicitud'}
        </Button>
      </div>
    </div>
  );
}
