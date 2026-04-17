import { apiRequest } from './client';
import type { SolicitudEstado, SolicitudState } from '@/types/solicitudes';

export interface CreateSolicitudDto {
  propTipoPersona: 'fisica' | 'moral';
  propNombreCompleto: string;
  propRfc?: string;
  propCorreo?: string;
  propTelefono?: string;
  predioResumen: string;
  claveCatastral?: string;
  adminId?: string;
  tipoContratacionId?: string;
  formData: SolicitudState;
}

export interface UpdateSolicitudDto {
  propNombreCompleto: string;
  propRfc?: string;
  propCorreo?: string;
  propTelefono?: string;
  predioResumen: string;
  claveCatastral?: string;
  adminId?: string;
  tipoContratacionId?: string;
  formData: SolicitudState;
}

/** Respuesta típica del backend al crear una solicitud */
export interface SolicitudCreatedDto {
  id: string;
  folio: string;
}

export interface SolicitudApiDto {
  id: string;
  folio: string;
  fechaSolicitud: string;
  propNombreCompleto: string;
  propTelefono?: string | null;
  predioResumen: string;
  adminId?: string | null;
  tipoContratacionId?: string | null;
  estado: SolicitudEstado;
  formData: SolicitudState;
  createdAt: string;
}

export async function createSolicitud(dto: CreateSolicitudDto): Promise<SolicitudCreatedDto> {
  return apiRequest<SolicitudCreatedDto>('/solicitudes', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateSolicitud(sid: string, dto: UpdateSolicitudDto): Promise<void> {
  await apiRequest<void>(`/solicitudes/${sid}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function fetchSolicitud(id: string): Promise<SolicitudApiDto> {
  return apiRequest<SolicitudApiDto>(`/solicitudes/${id}`);
}
