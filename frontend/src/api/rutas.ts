import { apiRequest, hasApi } from './client';

export interface RutaDto {
  id: string;
  zonaId: string;
  sector: string;
  libreta: string;
  lecturista: string;
  zona?: { id: string; nombre: string };
  contratoIds: string[];
  contratos?: { id: string; nombre: string; estado: string }[];
}

export async function fetchRutas(params?: { zonaId?: string }): Promise<RutaDto[]> {
  const q = new URLSearchParams();
  if (params?.zonaId) q.set('zonaId', params.zonaId);
  q.set('limit', '500');
  const res = await apiRequest<RutaDto[] | { data: RutaDto[] }>(`/rutas?${q.toString()}`);
  return Array.isArray(res) ? res : ((res as { data: RutaDto[] }).data ?? []);
}

export { hasApi };
