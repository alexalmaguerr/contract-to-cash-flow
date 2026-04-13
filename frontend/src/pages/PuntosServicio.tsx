import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Plus, RefreshCw } from 'lucide-react';

import {
  fetchCalibres,
  fetchCodigosRecorrido,
  fetchEstructurasTecnicas,
  fetchSectoresHidraulicos,
  fetchTiposCorte,
  fetchTiposSuministro,
  fetchZonasFacturacion,
} from '@/api/catalogos';
import { createPuntoServicio, fetchPuntosServicio } from '@/api/puntos-servicio';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ADMINISTRACIONES = [
  { id: '1', nombre: 'QUERÉTARO' },
  { id: '2', nombre: 'SANTA ROSA JÁUREGUI' },
  { id: '3', nombre: 'CORREGIDORA' },
  { id: '4', nombre: 'PEDRO ESCOBEDO' },
  { id: '5', nombre: 'TEQUISQUIAPAN' },
  { id: '6', nombre: 'EZEQUIEL MONTES' },
  { id: '7', nombre: 'AMEALCO DE BONFIL' },
  { id: '8', nombre: 'HUIMILPAN' },
  { id: '9', nombre: 'CADEREYTA DE MONTES-SAN JOAQUÍN' },
  { id: '10', nombre: 'COLÓN-TOLIMÁN' },
  { id: '11', nombre: 'JALPAN DE SERRA-LANDA DE MATAMOROS-ARROYO SECO' },
  { id: '12', nombre: 'EL MARQUÉS' },
  { id: '13', nombre: 'PINAL DE AMOLES-PEÑAMILLER' },
];

const ESTADOS_SUMINISTRO = [
  'Sin contrato',
  'Con servicio',
  'Cortado por deuda',
  'Cortado baja temporal',
];


const DISTRITOS = [
  { id: '1', nombre: '01-DISTRITO NORORIENTE' },
  { id: '2', nombre: '02-DISTRITO NORPONIENTE' },
  { id: '3', nombre: '03-ZONA SURORIENTE' },
  { id: '4', nombre: '04-ZONA SURPONIENTE' },
];

const TIPOS_PUNTO_SERVICIO = [
  { id: '1', nombre: 'DOMESTICO APOYO SOCIAL' },
  { id: '2', nombre: 'COMERCIAL' },
  { id: '3', nombre: 'INDUSTRIAL' },
  { id: '4', nombre: 'GANADERO' },
  { id: '5', nombre: 'PUBLICO OFICIAL' },
  { id: '6', nombre: 'PUBLICO CONCESIONADO' },
  { id: '7', nombre: 'HIDRANTE' },
  { id: '8', nombre: 'INST. DE BENEFICIENCIA' },
  { id: '9', nombre: 'DOMÉSTICO ECONÓMICO' },
  { id: '10', nombre: 'DOMÉSTICO MEDIO' },
  { id: '11', nombre: 'DOMÉSTICO ALTO' },
  { id: '12', nombre: 'DOMÉSTICO ZONA RURAL' },
  { id: '13', nombre: 'DOMÉSTICO CABECERA ECONÓMICA' },
  { id: '14', nombre: 'DOMÉSTICO CABECERA MEDIA' },
];

interface FormState {
  codigo: string;
  claveCatastral: string;
  folioExpediente: string;
  administracion: string;
  estructuraTecnicaId: string;
  sectorHidraulicoId: string;
  calibreId: string;
  tipoPuntoServicio: string;
  tipoSuministroId: string;
  zonaFacturacionId: string;
  distritoId: string;
  codigoRecorridoId: string;
  tipoCorteId: string;
  estadoSuministro: string;
  fechaInstalacion: string;
  fechaCorte: string;
  coordenadaLat: string;
  coordenadaLon: string;
  libreta: string;
  cortePosible: boolean;
  noAccesible: boolean;
  deshabitado: boolean;
  posibilidadFraude: boolean;
}

const INITIAL_FORM: FormState = {
  codigo: '',
  claveCatastral: '',
  folioExpediente: '',
  administracion: '',
  estructuraTecnicaId: '',
  sectorHidraulicoId: '',
  calibreId: '',
  tipoPuntoServicio: '',
  tipoSuministroId: '',
  zonaFacturacionId: '',
  distritoId: '',
  codigoRecorridoId: '',
  tipoCorteId: '',
  estadoSuministro: '',
  fechaInstalacion: '',
  fechaCorte: '',
  coordenadaLat: '',
  coordenadaLon: '',
  libreta: '',
  cortePosible: false,
  noAccesible: false,
  deshabitado: false,
  posibilidadFraude: false,
};

function formatDomicilio(
  d: { calle: string | null; numExterior: string | null; codigoPostal: string | null } | null | undefined,
): string {
  if (!d) return '—';
  const parts = [d.calle, d.numExterior, d.codigoPostal].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

export default function PuntosServicio() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const set =
    (field: keyof FormState) =>
    (val: string | boolean) =>
      setForm((prev) => ({ ...prev, [field]: val }));

  const onAdminChange = (adminId: string) => {
    setForm((prev) => ({
      ...prev,
      administracion: adminId,
      // Reset sector si ya no pertenece a la nueva administración
      sectorHidraulicoId: '',
    }));
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(INITIAL_FORM);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['puntos-servicio', 'catalogo'],
    queryFn: () => fetchPuntosServicio({ page: 1, limit: 500 }),
  });

  const { data: estructuras = [] } = useQuery({
    queryKey: ['estructuras-tecnicas'],
    queryFn: fetchEstructurasTecnicas,
  });
  const { data: sectores = [] } = useQuery({
    queryKey: ['sectores-hidraulicos'],
    queryFn: fetchSectoresHidraulicos,
  });
  const { data: calibres = [] } = useQuery({
    queryKey: ['calibres'],
    queryFn: fetchCalibres,
  });
  const { data: tiposSuministroRaw = [] } = useQuery({
    queryKey: ['tipos-suministro'],
    queryFn: fetchTiposSuministro,
  });
  const tiposSuministro = tiposSuministroRaw.filter((t) => t.codigo !== 'MIXTO');

  const { data: zonas = [] } = useQuery({
    queryKey: ['zonas-facturacion'],
    queryFn: fetchZonasFacturacion,
  });
  const { data: recorridos = [] } = useQuery({
    queryKey: ['codigos-recorrido'],
    queryFn: fetchCodigosRecorrido,
  });
  const { data: tiposCorte = [] } = useQuery({
    queryKey: ['tipos-corte'],
    queryFn: fetchTiposCorte,
  });

  const sectoresFiltrados = form.administracion
    ? sectores.filter((s) => s.administracionId === form.administracion)
    : sectores;

  const rows = data?.data ?? [];

  const createMut = useMutation({
    mutationFn: () =>
      createPuntoServicio({
        codigo: form.codigo.trim(),
        administracion: form.administracion || undefined,
        tipoPuntoServicio: form.tipoPuntoServicio || undefined,
        estructuraTecnicaId: form.estructuraTecnicaId || undefined,
        sectorHidraulicoId: form.sectorHidraulicoId || undefined,
        calibreId: form.calibreId || undefined,
        tipoSuministroId: form.tipoSuministroId || undefined,
        zonaFacturacionId: form.zonaFacturacionId || undefined,
        distritoId: form.distritoId || undefined,
        codigoRecorridoId: form.codigoRecorridoId || undefined,
        tipoCorteId: form.tipoCorteId || undefined,
        estadoSuministro: form.estadoSuministro || undefined,
        fechaInstalacion: form.fechaInstalacion || undefined,
        fechaCorte: form.fechaCorte || undefined,
        coordenadaLat: form.coordenadaLat ? parseFloat(form.coordenadaLat) : undefined,
        coordenadaLon: form.coordenadaLon ? parseFloat(form.coordenadaLon) : undefined,
        libreta: form.libreta || undefined,
        claveCatastral: form.claveCatastral || undefined,
        folioExpediente: form.folioExpediente || undefined,
        cortePosible: form.cortePosible,
        noAccesible: form.noAccesible,
        deshabitado: form.deshabitado,
        posibilidadFraude: form.posibilidadFraude,
        estado: 'Activo',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['puntos-servicio'] });
      toast.success('Punto de servicio creado', {
        description: `Código ${form.codigo.trim()} registrado correctamente.`,
      });
      closeDialog();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el punto de servicio.';
      toast.error('Error al crear', { description: msg });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Puntos de servicio"
        subtitle="Catálogo operativo: altas y consulta de puntos de servicio (tomas)."
        breadcrumbs={[{ label: 'Infraestructura', href: '#' }, { label: 'Puntos de servicio' }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Nuevo punto
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          Cargando puntos de servicio…
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Error al cargar el catálogo.'}
        </div>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay puntos de servicio registrados. Use &quot;Nuevo punto&quot; para crear el primero.
        </div>
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Domicilio</TableHead>
                <TableHead>Tipo suministro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((ps) => (
                <TableRow key={ps.id}>
                  <TableCell className="font-mono font-medium">{ps.codigo}</TableCell>
                  <TableCell>{ps.estado}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {formatDomicilio(ps.domicilio)}
                  </TableCell>
                  <TableCell>{ps.tipoSuministro?.descripcion ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {/* ── Modal ── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo punto de servicio</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">

            {/* Identificación */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Identificación
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="ps-codigo">
                    Código <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ps-codigo"
                    value={form.codigo}
                    onChange={(e) => set('codigo')(e.target.value)}
                    placeholder="Ej: PS-10001"
                    className="font-mono"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ps-catastral">Clave catastral</Label>
                  <Input
                    id="ps-catastral"
                    value={form.claveCatastral}
                    onChange={(e) => set('claveCatastral')(e.target.value)}
                    placeholder="Clave catastral"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ps-folio">Folio de expediente</Label>
                  <Input
                    id="ps-folio"
                    value={form.folioExpediente}
                    onChange={(e) => set('folioExpediente')(e.target.value)}
                    placeholder="Solo factibilidades"
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Clasificación */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Clasificación
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Administración</Label>
                  <Select value={form.administracion} onValueChange={onAdminChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar administración" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMINISTRACIONES.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.id} – {a.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tipo de estructura técnica</Label>
                  <Select value={form.estructuraTecnicaId} onValueChange={set('estructuraTecnicaId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estructura" />
                    </SelectTrigger>
                    <SelectContent>
                      {estructuras.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.codigo} – {e.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tipo de suministro</Label>
                  <Select value={form.tipoSuministroId} onValueChange={set('tipoSuministroId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposSuministro.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.codigo} – {t.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tipo de punto de servicio</Label>
                  <Select value={form.tipoPuntoServicio} onValueChange={set('tipoPuntoServicio')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PUNTO_SERVICIO.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.id} – {t.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Ubicación */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ubicación
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Sector hidráulico</Label>
                  <Select value={form.sectorHidraulicoId} onValueChange={set('sectorHidraulicoId')}>
                    <SelectTrigger>
                      <SelectValue placeholder={form.administracion ? 'Seleccionar sector' : 'Seleccione administración primero'} />
                    </SelectTrigger>
                    <SelectContent>
                      {sectoresFiltrados.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.codigo} – {s.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Zona de facturación</Label>
                  <Select value={form.zonaFacturacionId} onValueChange={set('zonaFacturacionId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zonas.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.codigo} – {z.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ps-lat">Latitud</Label>
                  <Input
                    id="ps-lat"
                    type="number"
                    step="any"
                    value={form.coordenadaLat}
                    onChange={(e) => set('coordenadaLat')(e.target.value)}
                    placeholder="Ej: 20.5881"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ps-lon">Longitud</Label>
                  <Input
                    id="ps-lon"
                    type="number"
                    step="any"
                    value={form.coordenadaLon}
                    onChange={(e) => set('coordenadaLon')(e.target.value)}
                    placeholder="Ej: -100.3899"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Datos técnicos */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Datos técnicos
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Calibre de la toma</Label>
                  <Select value={form.calibreId} onValueChange={set('calibreId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar calibre" />
                    </SelectTrigger>
                    <SelectContent>
                      {calibres.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.codigo} – {c.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Código de recorrido</Label>
                  <Select value={form.codigoRecorridoId} onValueChange={set('codigoRecorridoId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar recorrido" />
                    </SelectTrigger>
                    <SelectContent>
                      {recorridos.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.codigo} – {r.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ps-libreta">Libreta</Label>
                  <Input
                    id="ps-libreta"
                    value={form.libreta}
                    onChange={(e) => set('libreta')(e.target.value)}
                    placeholder="Número de libreta"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Distrito de atención de órdenes</Label>
                  <Select value={form.distritoId} onValueChange={set('distritoId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRITOS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Estado del suministro */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estado del suministro
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Estado del suministro</Label>
                  <Select value={form.estadoSuministro} onValueChange={set('estadoSuministro')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_SUMINISTRO.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tipo de corte</Label>
                  <Select value={form.tipoCorteId} onValueChange={set('tipoCorteId')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposCorte.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.codigo} – {t.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ps-fecha-corte">Fecha de corte</Label>
                  <Input
                    id="ps-fecha-corte"
                    type="date"
                    value={form.fechaCorte}
                    onChange={(e) => set('fechaCorte')(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Fechas */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fechas
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="ps-fecha-inst">Fecha de instalación</Label>
                  <Input
                    id="ps-fecha-inst"
                    type="date"
                    value={form.fechaInstalacion}
                    onChange={(e) => set('fechaInstalacion')(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Indicadores */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Indicadores
              </p>
              <div className="grid grid-cols-2 gap-y-3 sm:grid-cols-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={form.cortePosible}
                    onCheckedChange={(v) => set('cortePosible')(!!v)}
                  />
                  <span className="text-sm">Corte posible</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={form.noAccesible}
                    onCheckedChange={(v) => set('noAccesible')(!!v)}
                  />
                  <span className="text-sm">No accesible</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={form.deshabitado}
                    onCheckedChange={(v) => set('deshabitado')(!!v)}
                  />
                  <span className="text-sm">Deshabitado</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={form.posibilidadFraude}
                    onCheckedChange={(v) => set('posibilidadFraude')(!!v)}
                  />
                  <span className="text-sm">Posibilidad de fraude</span>
                </label>
              </div>
            </section>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!form.codigo.trim() || createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Crear'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/contratos">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a contratos
          </Link>
        </Button>
      </div>
    </div>
  );
}
