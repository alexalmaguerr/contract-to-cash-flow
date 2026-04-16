import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardPlus,
  ClipboardList,
  Pencil,
  Search,
  ClipboardCheck,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSolicitudesStore } from '@/hooks/useSolicitudesStore';
import type { SolicitudRecord, OrdenInspeccionData, SolicitudEstado } from '@/types/solicitudes';

// ── Catalogues for inspection form ───────────────────────────────────────────

const MATERIAL_CALLE = [
  { id: 'concreto_hidraulico', label: 'Concreto hidráulico' },
  { id: 'concreto_asfaltico', label: 'Concreto asfáltico' },
  { id: 'tierra', label: 'Tierra' },
  { id: 'adoquin', label: 'Adoquín' },
  { id: 'otro', label: 'Otro' },
];

const MATERIAL_BANQUETA = [
  { id: 'concreto_hidraulico', label: 'Concreto hidráulico' },
  { id: 'tierra', label: 'Tierra' },
  { id: 'adoquin', label: 'Adoquín' },
  { id: 'otro', label: 'Otro' },
];

const DIAMETROS_TOMA = ['1/2"', '3/4"', '1"', '1.5"', '2"', '3"', '4"'];

// ── Status badge ──────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<SolicitudEstado, { label: string; icon: React.ElementType; className: string }> = {
  borrador: {
    label: 'Borrador',
    icon: Clock,
    className: 'border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  },
  inspeccion_pendiente: {
    label: 'Inspección pendiente',
    icon: AlertCircle,
    className: 'border-amber-400/60 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  inspeccion_en_proceso: {
    label: 'En inspección',
    icon: Loader2,
    className: 'border-blue-400/60 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  },
  inspeccion_completada: {
    label: 'Insp. completada',
    icon: CheckCircle2,
    className: 'border-emerald-400/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  cotizado: {
    label: 'Cotizado',
    icon: ClipboardCheck,
    className: 'border-purple-400/60 bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  },
  contratado: {
    label: 'Contratado',
    icon: CheckCircle2,
    className: 'border-emerald-600/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200',
  },
};

function EstadoBadge({ estado }: { estado: SolicitudEstado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('flex w-fit items-center gap-1 text-xs', cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

// ── Inspection detail helpers ─────────────────────────────────────────────────

const MATERIAL_LABEL: Record<string, string> = {
  concreto_hidraulico: 'Concreto hidráulico',
  concreto_asfaltico: 'Concreto asfáltico',
  tierra: 'Tierra',
  adoquin: 'Adoquín',
  otro: 'Otro',
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// ── YesNo pill ────────────────────────────────────────────────────────────────

function YesNo({
  id,
  value,
  onChange,
}: {
  id: string;
  value: 'si' | 'no' | '';
  onChange: (v: 'si' | 'no') => void;
}) {
  return (
    <RadioGroup id={id} value={value} onValueChange={(v) => onChange(v as 'si' | 'no')} className="flex flex-row gap-0">
      {(['si', 'no'] as const).map((opt) => (
        <Label
          key={opt}
          htmlFor={`${id}-${opt}`}
          className={cn(
            'flex cursor-pointer items-center gap-1 border px-3 py-1.5 text-sm font-medium transition-colors select-none',
            opt === 'si' ? 'rounded-l-md border-r-0' : 'rounded-r-md',
            value === opt
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-input hover:bg-accent',
          )}
        >
          <RadioGroupItem id={`${id}-${opt}`} value={opt} className="sr-only" />
          {opt === 'si' ? 'Sí' : 'No'}
        </Label>
      ))}
    </RadioGroup>
  );
}

// ── Inspection Sheet ──────────────────────────────────────────────────────────

function OrdenInspeccionSheet({
  record,
  open,
  onClose,
  onSave,
}: {
  record: SolicitudRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, orden: OrdenInspeccionData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<OrdenInspeccionData>>({});

  function startEdit() {
    setDraft(record?.ordenInspeccion ?? { estado: 'en_proceso' });
    setEditing(true);
  }

  function set(patch: Partial<OrdenInspeccionData>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    if (!record) return;
    onSave(record.id, draft as OrdenInspeccionData);
    setEditing(false);
  }

  if (!record) return null;

  const orden = record.ordenInspeccion;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { onClose(); setEditing(false); } }}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[540px]">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            Orden de inspección
          </SheetTitle>
          <div className="text-xs text-muted-foreground">
            {record.folio} — {record.propNombreCompleto}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium">Domicilio del predio: </span>
            {record.predioResumen}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* No results yet */}
          {!orden && !editing && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold">Orden de inspección en proceso</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Aún no se han recibido los resultados de la inspección en campo. El inspector registrará los datos una vez concluida.
                </p>
              </div>
              <Button type="button" size="sm" onClick={startEdit}>
                Registrar resultados
              </Button>
            </div>
          )}

          {/* Results already recorded — view mode */}
          {orden && !editing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {orden.estado === 'completada' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  <span className="font-medium">
                    {orden.estado === 'completada' ? 'Inspección completada' : 'Inspección en proceso'}
                  </span>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={startEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                </Button>
              </div>

              <Separator />

              {/* Inspector / fecha */}
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Inspector" value={orden.inspector} />
                <DetailRow label="Fecha de inspección" value={orden.fechaInspeccion} />
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vía pública</p>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Material de calle" value={orden.materialCalle ? MATERIAL_LABEL[orden.materialCalle] : undefined} />
                <DetailRow label="Material de banqueta" value={orden.materialBanqueta ? MATERIAL_LABEL[orden.materialBanqueta] : undefined} />
                <DetailRow label="Metros ruptura de calle" value={orden.metrosRupturaCalle ? `${orden.metrosRupturaCalle} ml` : undefined} />
                <DetailRow label="Metros ruptura de banqueta" value={orden.metrosRupturaBanqueta ? `${orden.metrosRupturaBanqueta} ml` : undefined} />
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Red de agua</p>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="¿Existe red en frente del predio?" value={orden.existeRed === 'si' ? 'Sí' : orden.existeRed === 'no' ? 'No' : undefined} />
                <DetailRow label="Distancia de la red al predio" value={orden.distanciaRed ? `${orden.distanciaRed} m` : undefined} />
                <DetailRow label="Presión en la red" value={orden.presionRed ? `${orden.presionRed} kg/cm²` : undefined} />
                <DetailRow label="Tipo de material de la red" value={orden.tipoMaterialRed} />
                <DetailRow label="Profundidad de la red" value={orden.profundidadRed ? `${orden.profundidadRed} m` : undefined} />
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Toma</p>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Diámetro de toma requerido" value={orden.diametroToma} />
                <DetailRow label="¿Existe toma actualmente?" value={orden.tomaExistente === 'si' ? 'Sí' : orden.tomaExistente === 'no' ? 'No' : undefined} />
                {orden.tomaExistente === 'si' && (
                  <>
                    <DetailRow label="Diámetro de toma existente" value={orden.diametroTomaExistente} />
                    <DetailRow label="Estado de toma existente" value={orden.estadoTomaExistente} />
                  </>
                )}
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Medidor</p>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="¿Existe medidor actualmente?" value={orden.medidorExistente === 'si' ? 'Sí' : orden.medidorExistente === 'no' ? 'No' : undefined} />
                {orden.medidorExistente === 'si' && (
                  <DetailRow label="Núm. de medidor existente" value={orden.numMedidorExistente} />
                )}
              </div>

              {orden.observaciones && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observaciones</p>
                    <p className="text-sm">{orden.observaciones}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Edit / create form */}
          {editing && (
            <div className="space-y-5">
              <p className="text-sm font-semibold">Registrar resultados de inspección</p>

              {/* Estado */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado de la inspección</Label>
                <RadioGroup
                  value={draft.estado ?? 'en_proceso'}
                  onValueChange={(v) => set({ estado: v as 'en_proceso' | 'completada' })}
                  className="flex flex-row gap-0"
                >
                  {([['en_proceso', 'En proceso'], ['completada', 'Completada']] as const).map(([val, lbl]) => (
                    <Label
                      key={val}
                      htmlFor={`insp-estado-${val}`}
                      className={cn(
                        'flex cursor-pointer items-center border px-3.5 py-1.5 text-sm font-medium transition-colors select-none',
                        val === 'en_proceso' ? 'rounded-l-md border-r-0' : 'rounded-r-md',
                        draft.estado === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent',
                      )}
                    >
                      <RadioGroupItem id={`insp-estado-${val}`} value={val} className="sr-only" />
                      {lbl}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Inspector</Label>
                  <Input className="h-9" placeholder="Nombre del inspector" value={draft.inspector ?? ''} onChange={(e) => set({ inspector: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Fecha de inspección</Label>
                  <Input className="h-9" type="date" value={draft.fechaInspeccion ?? ''} onChange={(e) => set({ fechaInspeccion: e.target.value })} />
                </div>
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vía pública</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Material de calle</Label>
                  <Select value={draft.materialCalle ?? ''} onValueChange={(v) => set({ materialCalle: v as OrdenInspeccionData['materialCalle'] })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_CALLE.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Material de banqueta</Label>
                  <Select value={draft.materialBanqueta ?? ''} onValueChange={(v) => set({ materialBanqueta: v as OrdenInspeccionData['materialBanqueta'] })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_BANQUETA.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Metros ruptura de calle (ml)</Label>
                  <Input className="h-9" type="number" min="0" step="0.01" placeholder="0.00" value={draft.metrosRupturaCalle ?? ''} onChange={(e) => set({ metrosRupturaCalle: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Metros ruptura de banqueta (ml)</Label>
                  <Input className="h-9" type="number" min="0" step="0.01" placeholder="0.00" value={draft.metrosRupturaBanqueta ?? ''} onChange={(e) => set({ metrosRupturaBanqueta: e.target.value })} />
                </div>
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Red de agua</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-sm">¿Existe red en frente del predio?</Label>
                  <YesNo id="insp-existe-red" value={draft.existeRed ?? ''} onChange={(v) => set({ existeRed: v })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Distancia de la red al predio (m)</Label>
                  <Input className="h-9" type="number" min="0" step="0.1" placeholder="0.0" value={draft.distanciaRed ?? ''} onChange={(e) => set({ distanciaRed: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Presión en la red (kg/cm²)</Label>
                  <Input className="h-9" type="number" min="0" step="0.01" placeholder="0.00" value={draft.presionRed ?? ''} onChange={(e) => set({ presionRed: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Tipo de material de la red</Label>
                  <Input className="h-9" placeholder="Ej. PVC, Asbesto…" value={draft.tipoMaterialRed ?? ''} onChange={(e) => set({ tipoMaterialRed: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Profundidad de la red (m)</Label>
                  <Input className="h-9" type="number" min="0" step="0.01" placeholder="0.00" value={draft.profundidadRed ?? ''} onChange={(e) => set({ profundidadRed: e.target.value })} />
                </div>
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Toma</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Diámetro de toma requerido</Label>
                  <Select value={draft.diametroToma ?? ''} onValueChange={(v) => set({ diametroToma: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>
                      {DIAMETROS_TOMA.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-sm">¿Existe toma actualmente?</Label>
                  <YesNo id="insp-toma-existe" value={draft.tomaExistente ?? ''} onChange={(v) => set({ tomaExistente: v })} />
                </div>
                {draft.tomaExistente === 'si' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-sm">Diámetro toma existente</Label>
                      <Select value={draft.diametroTomaExistente ?? ''} onValueChange={(v) => set({ diametroTomaExistente: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                        <SelectContent>
                          {DIAMETROS_TOMA.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Estado de toma existente</Label>
                      <Select value={draft.estadoTomaExistente ?? ''} onValueChange={(v) => set({ estadoTomaExistente: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                        <SelectContent>
                          {['Buena', 'Regular', 'Mala'].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Medidor</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-sm">¿Existe medidor actualmente?</Label>
                  <YesNo id="insp-medidor-existe" value={draft.medidorExistente ?? ''} onChange={(v) => set({ medidorExistente: v })} />
                </div>
                {draft.medidorExistente === 'si' && (
                  <div className="space-y-1">
                    <Label className="text-sm">Núm. de medidor existente</Label>
                    <Input className="h-9" placeholder="Núm. medidor" value={draft.numMedidorExistente ?? ''} onChange={(e) => set({ numMedidorExistente: e.target.value })} />
                  </div>
                )}
              </div>

              <Separator />
              <div className="space-y-1">
                <Label className="text-sm">Observaciones del inspector</Label>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Notas adicionales del inspector…"
                  value={draft.observaciones ?? ''}
                  onChange={(e) => set({ observaciones: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {editing && (
          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button type="button" onClick={handleSave} className="bg-[#007BFF] hover:bg-blue-600 text-white">
              Guardar inspección
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Main list page ────────────────────────────────────────────────────────────

export default function Solicitudes() {
  const navigate = useNavigate();
  const store = useSolicitudesStore();
  const [search, setSearch] = useState('');
  const [inspRecord, setInspRecord] = useState<SolicitudRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return store.records;
    return store.records.filter(
      (r) =>
        r.folio.toLowerCase().includes(q) ||
        r.propNombreCompleto.toLowerCase().includes(q) ||
        r.predioResumen.toLowerCase().includes(q),
    );
  }, [store.records, search]);

  // KPI counts
  const total = store.records.length;
  const pendientes = store.records.filter((r) => r.estado === 'borrador' || r.estado === 'inspeccion_pendiente').length;
  const enProceso = store.records.filter((r) => r.estado === 'inspeccion_en_proceso').length;
  const completadas = store.records.filter((r) => r.estado === 'inspeccion_completada' || r.estado === 'cotizado' || r.estado === 'contratado').length;

  function handleSaveOrden(id: string, orden: OrdenInspeccionData) {
    store.setOrdenInspeccion(id, orden);
    setInspRecord((prev) => (prev?.id === id ? { ...prev, ordenInspeccion: orden } : prev));
  }

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Solicitudes de Servicio</h1>
          <p className="text-sm text-muted-foreground">CEA-FUS01 — Registro de solicitudes de contratación en ventanilla</p>
        </div>
        <Button
          type="button"
          className="bg-[#007BFF] hover:bg-blue-600 text-white"
          onClick={() => navigate('/app/solicitudes/nueva')}
        >
          <ClipboardPlus className="mr-2 h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>

      {/* ── Flow indicator ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Flujo:</span>
        {[
          'Solicitud CEA-FUS01',
          'Inspección en campo',
          'Cotización (5 días vigencia)',
          'Contratación',
        ].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-1.5">
            <span className={i === 0 ? 'font-medium text-primary' : ''}>{step}</span>
            {i < arr.length - 1 && <span className="text-muted-foreground/50">→</span>}
          </span>
        ))}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total solicitudes', value: total, className: '' },
          { label: 'Pendientes de inspección', value: pendientes, className: 'text-amber-600' },
          { label: 'En inspección', value: enProceso, className: 'text-blue-600' },
          { label: 'Insp. completadas', value: completadas, className: 'text-emerald-600' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={cn('text-3xl font-bold tabular-nums', kpi.className)}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por folio, propietario o domicilio…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <p className="font-medium">
              {store.records.length === 0 ? 'No hay solicitudes registradas' : 'Sin resultados para este filtro'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {store.records.length === 0
                ? 'Cuando llegue un cliente a ventanilla, usa el botón "Nueva solicitud" para empezar.'
                : 'Ajusta la búsqueda para encontrar solicitudes.'}
            </p>
          </div>
          {store.records.length === 0 && (
            <Button type="button" onClick={() => navigate('/app/solicitudes/nueva')} className="bg-[#007BFF] hover:bg-blue-600 text-white">
              <ClipboardPlus className="mr-2 h-4 w-4" />
              Nueva solicitud
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Folio</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Propietario</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Domicilio del predio</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{r.folio}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.propNombreCompleto}</span>
                    {r.propTelefono && r.propTelefono !== '—' && (
                      <span className="block text-xs text-muted-foreground">{r.propTelefono}</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {r.predioResumen}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {r.fechaSolicitud}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={r.estado} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => navigate(`/app/solicitudes/${r.id}/editar`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-8 gap-1.5',
                          r.ordenInspeccion?.estado === 'completada'
                            ? 'border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400'
                            : r.ordenInspeccion?.estado === 'en_proceso'
                            ? 'border-blue-400/50 text-blue-700 hover:bg-blue-50 dark:text-blue-400'
                            : '',
                        )}
                        onClick={() => setInspRecord(r)}
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        Inspección
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Inspection Sheet ──────────────────────────────────────────── */}
      <OrdenInspeccionSheet
        record={inspRecord}
        open={!!inspRecord}
        onClose={() => setInspRecord(null)}
        onSave={handleSaveOrden}
      />
    </div>
  );
}
