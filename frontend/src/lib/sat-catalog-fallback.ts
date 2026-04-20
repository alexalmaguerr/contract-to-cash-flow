/** Catálogo mínimo offline; el API + seed replica el Excel SAT completo. */

export type RegimenFiscalOfflineRow = {
  id: string;
  nombre: string;
  aplicaFisica: boolean;
  aplicaMoral: boolean;
};

export type UsoCfdiOfflineRow = {
  id: string;
  nombre: string;
  aplicaFisica: boolean;
  aplicaMoral: boolean;
  regimenesReceptorPermitidos: string;
};

export const REGIMEN_FISCAL_OFFLINE: RegimenFiscalOfflineRow[] = [
  { id: '601', nombre: 'General de Ley Personas Morales', aplicaFisica: false, aplicaMoral: true },
  { id: '603', nombre: 'Personas Morales con Fines no Lucrativos', aplicaFisica: false, aplicaMoral: true },
  {
    id: '605',
    nombre: 'Sueldos y Salarios e Ingresos Asimilados',
    aplicaFisica: true,
    aplicaMoral: false,
  },
  { id: '606', nombre: 'Arrendamiento', aplicaFisica: true, aplicaMoral: false },
  {
    id: '612',
    nombre: 'Personas Físicas con Actividades Empresariales',
    aplicaFisica: true,
    aplicaMoral: false,
  },
  { id: '616', nombre: 'Sin obligaciones fiscales', aplicaFisica: true, aplicaMoral: false },
  { id: '621', nombre: 'Incorporación Fiscal', aplicaFisica: true, aplicaMoral: false },
  {
    id: '622',
    nombre: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
    aplicaFisica: false,
    aplicaMoral: true,
  },
  { id: '626', nombre: 'Régimen Simplificado de Confianza', aplicaFisica: true, aplicaMoral: true },
];

/** Mismos `regimenesReceptorPermitidos` que `catalogo-sat-seed-data.ts` para estos códigos. */
export const USO_CFDI_OFFLINE: UsoCfdiOfflineRow[] = [
  {
    id: 'G01',
    nombre: 'Adquisición de mercancias',
    aplicaFisica: true,
    aplicaMoral: true,
    regimenesReceptorPermitidos: '601, 603, 606, 612, 620, 621, 622, 623, 624, 625,626',
  },
  {
    id: 'G03',
    nombre: 'Gastos en general',
    aplicaFisica: true,
    aplicaMoral: true,
    regimenesReceptorPermitidos: '601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626',
  },
  {
    id: 'I01',
    nombre: 'Construcciones',
    aplicaFisica: true,
    aplicaMoral: true,
    regimenesReceptorPermitidos: '601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626',
  },
  {
    id: 'S01',
    nombre: 'Sin efectos fiscales',
    aplicaFisica: true,
    aplicaMoral: true,
    regimenesReceptorPermitidos:
      '601, 603, 605, 606, 608, 610, 611, 612, 614, 616, 620, 621, 622, 623, 624, 607, 615, 625, 626',
  },
  {
    id: 'CP01',
    nombre: 'Pagos',
    aplicaFisica: true,
    aplicaMoral: true,
    regimenesReceptorPermitidos:
      '601, 603, 605, 606, 608, 610, 611, 612, 614, 616, 620, 621, 622, 623, 624, 607, 615, 625, 626',
  },
  {
    id: 'CN01',
    nombre: 'Nómina',
    aplicaFisica: true,
    aplicaMoral: false,
    regimenesReceptorPermitidos: '605',
  },
];

/** Parsea la columna SAT «Régimen Fiscal Receptor» (lista separada por comas). */
export function parseRegimenesReceptorPermitidos(raw: string | null | undefined): Set<string> {
  if (raw == null || String(raw).trim() === '') return new Set();
  return new Set(
    String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
}

export function usoCfdiMatchesRegimenSeleccionado(
  regimenesRaw: string | null | undefined,
  regimenSeleccionado: string,
): boolean {
  const permitidos = parseRegimenesReceptorPermitidos(regimenesRaw);
  if (permitidos.size === 0) return false;
  return permitidos.has(regimenSeleccionado.trim());
}

/** Valor guardado tipo "605 - …" → clave de tres dígitos para el select SAT. */
export function regimenClaveFromStored(val: string | undefined): string {
  if (!val?.trim()) return '';
  const t = val.trim();
  const m = t.match(/^(\d{3})\b/);
  return m ? m[1] : t.split(/\s*-\s*/)[0]?.trim() ?? '';
}

/** Valor guardado tipo "G03 - …" → clave de uso CFDI. */
export function usoCfdiClaveFromStored(val: string | undefined): string {
  if (!val?.trim()) return '';
  const head = val.trim().split(/\s*-\s*/)[0]?.trim() ?? '';
  return /^[A-Z0-9]{2,4}$/i.test(head) ? head.toUpperCase() : '';
}
