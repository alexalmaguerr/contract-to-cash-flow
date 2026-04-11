import { apiRequest, hasApi } from './client';

export interface MedidorDto {
  id: string;
  contratoId: string;
  serie: string;
  estado: string;
  lecturaInicial: number;
  cobroDiferido: boolean;
  marca: string | null;
  modelo: string | null;
  contrato?: { id: string; nombre: string; estado: string; zonaId: string | null };
}

export interface MedidorBodegaDto {
  id: string;
  serie: string;
  zonaId: string | null;
  estado: string;
  marca: string | null;
  modelo: string | null;
}

export async function fetchMedidores(params?: { zonaId?: string; estado?: string }): Promise<MedidorDto[]> {
  const q = new URLSearchParams();
  if (params?.zonaId) q.set('zonaId', params.zonaId);
  if (params?.estado) q.set('estado', params.estado);
  q.set('limit', '500');
  const res = await apiRequest<MedidorDto[]>(`/medidores?${q.toString()}`);
  return Array.isArray(res) ? res : [];
}

export async function fetchMedidoresBodega(params?: { zonaId?: string; estado?: string }): Promise<MedidorBodegaDto[]> {
  const q = new URLSearchParams();
  if (params?.zonaId) q.set('zonaId', params.zonaId);
  if (params?.estado) q.set('estado', params.estado);
  q.set('limit', '500');
  const res = await apiRequest<MedidorBodegaDto[]>(`/medidores/bodega?${q.toString()}`);
  return Array.isArray(res) ? res : [];
}

export { hasApi };
