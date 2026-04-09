import { apiRequest } from './client';

export interface CatalogoGrupoActividad {
  id: string;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export interface CatalogoActividad {
  id: string;
  codigo: string;
  descripcion: string;
  grupoId: string | null;
  activo: boolean;
  grupo?: CatalogoGrupoActividad;
}

export interface CatalogoCategoria {
  id: string;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export interface CatalogoTipoRelacionPS {
  id: string;
  codigo: string;
  descripcion: string;
  metodo: string;
  reparteConsumo: boolean;
  activo: boolean;
}

export const fetchActividades = () =>
  apiRequest<CatalogoActividad[]>('/catalogos/actividades');

export const fetchGruposActividad = () =>
  apiRequest<CatalogoGrupoActividad[]>('/catalogos/grupos-actividad');

export const fetchCategorias = () =>
  apiRequest<CatalogoCategoria[]>('/catalogos/categorias');

export const fetchTiposRelacionPS = () =>
  apiRequest<CatalogoTipoRelacionPS[]>('/catalogos/tipos-relacion-ps');

// ── Contratación: conceptos y cláusulas ─────────────────────────────────────

export interface ConceptoCobro {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  montoBase?: string | number | null;
  ivaPct?: string | number | null;
  formula?: string | null;
  variablesFormula?: unknown;
  activo: boolean;
}

export interface ClausulaContractual {
  id: string;
  codigo: string;
  titulo: string;
  contenido: string;
  version: string;
  activo: boolean;
}

export const fetchConceptosCobro = () =>
  apiRequest<ConceptoCobro[]>('/catalogos/conceptos-cobro');

export const fetchClausulas = () =>
  apiRequest<ClausulaContractual[]>('/catalogos/clausulas');

// ── Punto de servicio (operativo) ───────────────────────────────────────────

export interface CatalogoTipoCorte {
  id: string;
  codigo: string;
  descripcion: string;
  impacto?: string | null;
  requiereCuadrilla: boolean;
  activo: boolean;
}

export interface CatalogoCodigoDescripcion {
  id: string;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export interface CatalogoCodigoRecorrido extends CatalogoCodigoDescripcion {
  rutaId?: string | null;
}

export const fetchTiposCorte = () =>
  apiRequest<CatalogoTipoCorte[]>('/catalogos/tipos-corte');

export const fetchTiposSuministro = () =>
  apiRequest<CatalogoCodigoDescripcion[]>('/catalogos/tipos-suministro');

export const fetchEstructurasTecnicas = () =>
  apiRequest<CatalogoCodigoDescripcion[]>('/catalogos/estructuras-tecnicas');

export const fetchZonasFacturacion = () =>
  apiRequest<CatalogoCodigoDescripcion[]>('/catalogos/zonas-facturacion');

export const fetchCodigosRecorrido = () =>
  apiRequest<CatalogoCodigoRecorrido[]>('/catalogos/codigos-recorrido');
