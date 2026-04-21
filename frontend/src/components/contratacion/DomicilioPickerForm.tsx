import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import {
  fetchInegiEstados,
  fetchInegiMunicipiosCatalogo,
  fetchInegiLocalidadesCatalogo,
  fetchInegiColoniasCatalogo,
  type CatalogoEstadoINEGI,
  type CatalogoMunicipioINEGIRow,
  type CatalogoLocalidadINEGIRow,
  type CatalogoColoniaINEGIRow,
} from '@/api/domicilios-inegi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';

export interface DomicilioFormValue {
  estadoINEGIId: string;
  municipioINEGIId: string;
  localidadINEGIId: string;
  coloniaINEGIId: string;
  codigoPostal: string;
  calle: string;
  numExterior: string;
  numInterior: string;
  referencia: string;
}

interface Props {
  value: DomicilioFormValue;
  onChange: (v: DomicilioFormValue) => void;
  disabled?: boolean;
}

const EMPTY: DomicilioFormValue = {
  estadoINEGIId: '',
  municipioINEGIId: '',
  localidadINEGIId: '',
  coloniaINEGIId: '',
  codigoPostal: '',
  calle: '',
  numExterior: '',
  numInterior: '',
  referencia: '',
};

export const DOMICILIO_FORM_EMPTY = EMPTY;

export default function DomicilioPickerForm({ value, onChange, disabled = false }: Props) {
  const set = (patch: Partial<DomicilioFormValue>) => onChange({ ...value, ...patch });

  // ── Catálogos cascading ────────────────────────────────────────────────
  const { data: estados = [], isLoading: loadingEstados } = useQuery({
    queryKey: ['inegi-estados'],
    queryFn: fetchInegiEstados,
    staleTime: 10 * 60 * 1000,
  });

  const { data: mpioRes, isLoading: loadingMpios } = useQuery({
    queryKey: ['inegi-municipios', value.estadoINEGIId],
    queryFn: () => fetchInegiMunicipiosCatalogo({ estadoId: value.estadoINEGIId, limit: 200 }),
    enabled: Boolean(value.estadoINEGIId),
    staleTime: 10 * 60 * 1000,
  });
  const municipios: CatalogoMunicipioINEGIRow[] = mpioRes?.data ?? [];

  const { data: locRes, isLoading: loadingLocs } = useQuery({
    queryKey: ['inegi-localidades', value.municipioINEGIId],
    queryFn: () => fetchInegiLocalidadesCatalogo({ municipioId: value.municipioINEGIId, limit: 500 }),
    enabled: Boolean(value.municipioINEGIId),
    staleTime: 10 * 60 * 1000,
  });
  const localidades: CatalogoLocalidadINEGIRow[] = locRes?.data ?? [];

  const { data: colRes, isLoading: loadingCols } = useQuery({
    queryKey: ['inegi-colonias', value.municipioINEGIId],
    queryFn: () => fetchInegiColoniasCatalogo({ municipioId: value.municipioINEGIId, limit: 500 }),
    enabled: Boolean(value.municipioINEGIId),
    staleTime: 10 * 60 * 1000,
  });
  const colonias: CatalogoColoniaINEGIRow[] = colRes?.data ?? [];

  // Auto-fill CP when colonia is selected
  useEffect(() => {
    if (!value.coloniaINEGIId) return;
    const col = colonias.find((c) => c.id === value.coloniaINEGIId);
    if (col?.codigoPostal && col.codigoPostal !== value.codigoPostal) {
      set({ codigoPostal: col.codigoPostal });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.coloniaINEGIId, colonias]);

  const handleEstado = (id: string) => {
    onChange({ ...EMPTY, estadoINEGIId: id });
  };
  const handleMunicipio = (id: string) => {
    set({ municipioINEGIId: id, localidadINEGIId: '', coloniaINEGIId: '', codigoPostal: '' });
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {/* Estado */}
      <div className="space-y-1">
        <Label>Estado <span className="text-destructive">*</span></Label>
        {loadingEstados ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
          </div>
        ) : (
          <SearchableSelect
            value={value.estadoINEGIId}
            onValueChange={handleEstado}
            disabled={disabled}
            placeholder="Seleccionar estado"
            searchPlaceholder="Buscar estado…"
            options={estados.map((e: CatalogoEstadoINEGI) => ({ value: e.id, label: e.nombre }))}
          />
        )}
      </div>

      {/* Municipio */}
      <div className="space-y-1">
        <Label>Municipio <span className="text-destructive">*</span></Label>
        {loadingMpios ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
          </div>
        ) : (
          <SearchableSelect
            value={value.municipioINEGIId}
            onValueChange={handleMunicipio}
            disabled={disabled || !value.estadoINEGIId}
            placeholder={value.estadoINEGIId ? 'Seleccionar municipio' : 'Primero seleccione estado'}
            searchPlaceholder="Buscar municipio…"
            options={municipios.map((m: CatalogoMunicipioINEGIRow) => ({ value: m.id, label: m.nombre }))}
          />
        )}
      </div>

      {/* Localidad */}
      <div className="space-y-1">
        <Label>Localidad <span className="text-destructive">*</span></Label>
        {loadingLocs ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
          </div>
        ) : (
          <SearchableSelect
            value={value.localidadINEGIId}
            onValueChange={(id) => set({ localidadINEGIId: id })}
            disabled={disabled || !value.municipioINEGIId}
            placeholder="Seleccionar localidad"
            searchPlaceholder="Buscar localidad…"
            options={localidades.map((l: CatalogoLocalidadINEGIRow) => ({ value: l.id, label: l.nombre }))}
          />
        )}
      </div>

      {/* Colonia */}
      <div className="space-y-1">
        <Label>Colonia <span className="text-destructive">*</span></Label>
        {loadingCols ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
          </div>
        ) : (
          <SearchableSelect
            value={value.coloniaINEGIId}
            onValueChange={(id) => set({ coloniaINEGIId: id })}
            disabled={disabled || !value.municipioINEGIId}
            placeholder={value.municipioINEGIId ? 'Seleccionar colonia' : 'Primero seleccione municipio'}
            searchPlaceholder="Buscar colonia o C.P.…"
            options={colonias.map((c: CatalogoColoniaINEGIRow) => ({
              value: c.id,
              label: c.codigoPostal ? `${c.nombre} — ${c.codigoPostal}` : c.nombre,
            }))}
          />
        )}
      </div>

      {/* CP (auto-filled, editable) */}
      <div className="space-y-1">
        <Label>Código postal</Label>
        <Input
          className="h-9"
          placeholder="76000"
          value={value.codigoPostal}
          readOnly={disabled}
          disabled={disabled}
          onChange={(e) => set({ codigoPostal: e.target.value })}
          maxLength={5}
        />
      </div>

      {/* Calle */}
      <div className="space-y-1">
        <Label>Calle <span className="text-destructive">*</span></Label>
        <Input
          className="h-9"
          placeholder="Nombre de la calle"
          value={value.calle}
          readOnly={disabled}
          disabled={disabled}
          onChange={(e) => set({ calle: e.target.value })}
        />
      </div>

      {/* Número exterior */}
      <div className="space-y-1">
        <Label>Núm. exterior <span className="text-destructive">*</span></Label>
        <Input
          className="h-9"
          placeholder="123"
          value={value.numExterior}
          readOnly={disabled}
          disabled={disabled}
          onChange={(e) => set({ numExterior: e.target.value })}
        />
      </div>

      {/* Número interior */}
      <div className="space-y-1">
        <Label>Núm. interior</Label>
        <Input
          className="h-9"
          placeholder="A, Depto 2…"
          value={value.numInterior}
          readOnly={disabled}
          disabled={disabled}
          onChange={(e) => set({ numInterior: e.target.value })}
        />
      </div>

      {/* Referencia — full width */}
      <div className="col-span-2 space-y-1">
        <Label>Referencia</Label>
        <Input
          className="h-9"
          placeholder="Entre calles, punto de referencia…"
          value={value.referencia}
          readOnly={disabled}
          disabled={disabled}
          onChange={(e) => set({ referencia: e.target.value })}
        />
      </div>
    </div>
  );
}
