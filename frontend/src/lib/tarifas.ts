/**
 * Módulo de tarifas periódicas — CEA Querétaro.
 *
 * Fuente: Tarifas_periodicas.xlsx (Agua Potable, feb-2026)
 *
 * Estructura del JSON:
 *   tarifasAgua[administracion][tipoTarifa] = { precios: number[], tasa: number }
 *   precios[m3] = precio total acumulado para ese consumo
 *   tasa         = tasa de IVA (0 o 0.16)
 *
 * Alcantarillado y Saneamiento se calculan como porcentaje del cargo de agua.
 * Recargos son un porcentaje mensual sobre saldo vencido.
 */

import tarifasAgua from '@/data/tarifas-agua.json';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TarifaEntry = { precios: number[]; tasa: number };
export type TarifasAguaData = Record<string, Record<string, TarifaEntry>>;

const DATA = tarifasAgua as TarifasAguaData;

// ── Constantes de porcentaje ───────────────────────────────────────────────────

/** Alcantarillado = X% del cargo de agua (sin IVA) */
export const ALCANTARILLADO_RATE = 0.10;

/** Saneamiento = X% del cargo de agua (sin IVA) */
export const SANEAMIENTO_RATE = 0.12;

/** Recargo mensual sobre saldo vencido acumulado */
export const RECARGO_MENSUAL = 0.015;

// ── Catálogos ─────────────────────────────────────────────────────────────────

/** Lista de todas las administraciones disponibles en el catálogo */
export const ADMINISTRACIONES = Object.keys(DATA).sort();

/** Tipos de tarifa disponibles para una administración dada */
export function getTiposTarifa(administracion: string): string[] {
  return Object.keys(DATA[administracion] ?? {});
}

// ── Lookup principal ──────────────────────────────────────────────────────────

/**
 * Devuelve el cargo de agua para un consumo exacto.
 *
 * @param administracion  Nombre exacto de la administración (ej. "QUERÉTARO")
 * @param tipoTarifa      Tipo de tarifa (ej. "DOMÉSTICA MEDIO")
 * @param m3              Consumo en m³ (entero, 0–200)
 * @returns { precioBase, tasa } o null si no hay dato
 */
export function getPrecioAgua(
  administracion: string,
  tipoTarifa: string,
  m3: number,
): { precioBase: number; tasa: number } | null {
  const entry = DATA[administracion]?.[tipoTarifa];
  if (!entry) return null;

  const idx = Math.min(Math.max(Math.round(m3), 0), entry.precios.length - 1);
  const precioBase = entry.precios[idx] ?? 0;
  return { precioBase, tasa: entry.tasa };
}

// ── Cálculo completo de un periodo ───────────────────────────────────────────

export interface ConceptoPeriodo {
  agua: number;
  alcantarillado: number;
  saneamiento: number;
  ivaAgua: number;
  ivaAlcantarillado: number;
  ivaSaneamiento: number;
  subtotal: number;   // sin IVA
  iva: number;
  total: number;
}

/**
 * Calcula todos los cargos del periodo (agua + alcantarillado + saneamiento).
 *
 * @param administracion  Nombre de la administración
 * @param tipoTarifa      Tipo de tarifa
 * @param m3              Consumo en m³
 * @param unidades        Número de unidades servidas (multiplica el cargo)
 */
export function calcularCargoPeriodo(
  administracion: string,
  tipoTarifa: string,
  m3: number,
  unidades = 1,
): ConceptoPeriodo | null {
  const tarifaAgua = getPrecioAgua(administracion, tipoTarifa, m3);
  if (!tarifaAgua) return null;

  const agua = tarifaAgua.precioBase * unidades;
  const alcantarillado = agua * ALCANTARILLADO_RATE;
  const saneamiento = agua * SANEAMIENTO_RATE;

  const ivaAgua = agua * tarifaAgua.tasa;
  const ivaAlcantarillado = 0; // Alcantarillado no tiene IVA generalmente
  const ivaSaneamiento = 0;    // Saneamiento no tiene IVA generalmente

  const subtotal = agua + alcantarillado + saneamiento;
  const iva = ivaAgua + ivaAlcantarillado + ivaSaneamiento;

  return {
    agua,
    alcantarillado,
    saneamiento,
    ivaAgua,
    ivaAlcantarillado,
    ivaSaneamiento,
    subtotal,
    iva,
    total: subtotal + iva,
  };
}

// ── Mapa de nombres de administración ────────────────────────────────────────

/**
 * Intenta encontrar la administración en el catálogo a partir de un nombre
 * parcial o ID (e.g. "Querétaro" → "QUERÉTARO").
 */
export function resolveAdministracion(nombre?: string | null): string | null {
  if (!nombre) return null;
  const upper = nombre.toUpperCase().trim();
  // Exact match
  if (DATA[upper]) return upper;
  // Partial match
  const found = ADMINISTRACIONES.find((a) => a.includes(upper) || upper.includes(a.split('-')[0].trim()));
  return found ?? null;
}

/**
 * Mapa de tipos de contratación → tipo de tarifa en el CSV.
 * Ampliar según los tipos definidos en la base de datos.
 */
export const TIPO_CONTRATACION_TO_TARIFA: Record<string, string> = {
  // Nombres parciales o exactos del tipo de contratación → nombre en CSV
  'DOMÉSTICO INDIVIDUAL': 'DOMÉSTICA MEDIO',
  'DOMÉSTICO MEDIO':      'DOMÉSTICA MEDIO',
  'DOMESTICO MEDIO':      'DOMÉSTICA MEDIO',
  'DOMÉSTICO ALTO':       'DOMÉSTICO ALTO',
  'DOMÉSTICO ECONÓMICO':  'DOMESTICO ECONOMICO',
  'DOMÉSTICO ECONOMICO':  'DOMESTICO ECONOMICO',
  'APOYO SOCIAL':         'DOMÉSTICO APOYO SOCIAL',
  'BENEFICENCIA':         'BENEFICENCIA',
  'COMERCIAL':            'COMERCIAL',
  'INDUSTRIAL':           'INDUSTRIAL',
  'ZONA RURAL':           'DOMESTICO ZONA RURAL',
  'HIDRANTE':             'HIDRANTE',
  'PÚBLICO CONCESIONADO': 'PÚBLICO CONCESIONADO',
  'PÚBLICO OFICIAL':      'PÚBLICO OFICIAL',
  'SANTA MARIA':          'SANTA MARIA MAGDALENA',
};

/**
 * Resuelve el tipo de tarifa del CSV a partir del nombre del tipo de contratación.
 * Primero busca coincidencia exacta, luego parcial.
 */
export function resolveTipoTarifa(
  tipoContratacionNombre?: string | null,
  administracion = 'QUERÉTARO',
): string | null {
  if (!tipoContratacionNombre) return null;
  const upper = tipoContratacionNombre.toUpperCase().trim();

  // Exact key match
  if (TIPO_CONTRATACION_TO_TARIFA[tipoContratacionNombre]) {
    return TIPO_CONTRATACION_TO_TARIFA[tipoContratacionNombre];
  }

  // Partial key match
  for (const [key, val] of Object.entries(TIPO_CONTRATACION_TO_TARIFA)) {
    if (upper.includes(key.toUpperCase()) || key.toUpperCase().includes(upper)) {
      return val;
    }
  }

  // Fallback: look directly in the CSV tariff names
  const tiposTarifa = getTiposTarifa(administracion);
  const directMatch = tiposTarifa.find(
    (t) => t.toUpperCase() === upper || upper.includes(t.toUpperCase()) || t.toUpperCase().includes(upper),
  );
  return directMatch ?? null;
}
