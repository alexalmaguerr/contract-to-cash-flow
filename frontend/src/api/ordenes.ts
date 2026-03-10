import { apiRequest } from './client';

export interface OrdenDto {
  id: string;
  contratoId: string;
  tipo: string;
  estado: string;
  prioridad: string;
  fechaSolicitud: string;
  fechaProgramada?: string | null;
  fechaEjecucion?: string | null;
  operadorId?: string | null;
  notas?: string | null;
  externalRef?: string | null;
  createdAt: string;
  updatedAt: string;
  contrato?: { id: string; nombre: string; direccion: string };
  seguimientos?: Array<{
    id: string;
    fecha: string;
    estadoAnterior?: string | null;
    estadoNuevo?: string | null;
    nota?: string | null;
    usuario?: string | null;
  }>;
}

export interface OrdenesPaginadas {
  data: OrdenDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchOrdenesByContrato = (contratoId: string): Promise<OrdenDto[]> =>
  apiRequest<unknown>(`/ordenes?contratoId=${contratoId}&limit=50`).then((res) => {
    if (Array.isArray(res)) return res as OrdenDto[];
    if (res && Array.isArray((res as any).data)) return (res as any).data as OrdenDto[];
    if (res && Array.isArray((res as any).items)) return (res as any).items as OrdenDto[];
    return [];
  });

export const fetchOrdenes = (params?: {
  tipo?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) => {
  const q = new URLSearchParams();
  if (params?.tipo) q.set('tipo', params.tipo);
  if (params?.estado) q.set('estado', params.estado);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return apiRequest<OrdenesPaginadas>(`/ordenes?${q.toString()}`);
};

export const updateOrdenEstado = (id: string, estado: string, nota?: string) =>
  apiRequest<OrdenDto>(`/ordenes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado, nota }),
  });
