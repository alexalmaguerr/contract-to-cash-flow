import { apiRequest } from './client';

export interface PuntoServicioListItem {
  id: string;
  codigo: string;
  estado: string;
  domicilio?: {
    id: string;
    calle: string | null;
    numExterior: string | null;
    codigoPostal: string | null;
  } | null;
  tipoSuministro?: { id: string; codigo: string; descripcion: string } | null;
  _count?: { contratos: number };
}

export interface PuntosServicioListResponse {
  data: PuntoServicioListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function fetchPuntosServicio(params?: { page?: number; limit?: number; estado?: string }) {
  const q = new URLSearchParams();
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 100));
  if (params?.estado) q.set('estado', params.estado);
  return apiRequest<PuntosServicioListResponse>(`/puntos-servicio?${q.toString()}`);
}
