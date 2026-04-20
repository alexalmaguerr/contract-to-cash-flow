/**
 * Parseo de export AGEEML (INEGI) → filas listas para JSON de seed o import a BD.
 * Solo filas con CVE_ENT = 22 (Querétaro).
 */

import * as XLSX from 'xlsx';
import type { WorkSheet } from 'xlsx';

export type LocalidadQroAgeemlSeedRow = {
  /** Clave municipio INEGI 5 dígitos, ej. 22014 (debe existir en catalogo-municipios-qro-sige). */
  claveMunicipioINEGI: string;
  /** CVEGEO 9 dígitos, único por localidad. */
  claveINEGI: string;
  nombre: string;
};

function nombreLocalidad(raw: unknown): string {
  const s = String(raw ?? '')
    .trim()
    .slice(0, 512);
  return s || '(sin nombre)';
}

function claveFromCvegeo(raw: unknown): string | null {
  const digits = String(raw ?? '')
    .replace(/\D/g, '')
    .trim();
  if (digits.length < 9) return null;
  return digits.slice(-9);
}

function findHeaderRowIndex(aoa: unknown[][]): number {
  for (let i = 0; i < Math.min(30, aoa.length); i++) {
    const row = aoa[i];
    if (!Array.isArray(row) || row.length === 0) continue;
    if (String(row[0]).trim() === 'CVEGEO') return i;
  }
  return -1;
}

type ParsedRow = { cveEnt: string; cveMun: number; cveGeo: string; nomLoc: string };

function parseAgeemlSheet(sheet: WorkSheet): ParsedRow[] {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  const headerIdx = findHeaderRowIndex(aoa);
  if (headerIdx < 0) {
    throw new Error(
      'No se encontró la fila de cabecera (primera celda = CVEGEO). ¿Es un export AGEEML válido?',
    );
  }
  const header = aoa[headerIdx] as string[];
  const col = (name: string) => header.findIndex((c) => String(c).trim() === name);
  const iGeo = col('CVEGEO');
  const iEnt = col('CVE_ENT');
  const iMun = col('CVE_MUN');
  const iLoc = col('NOM_LOC');
  if (iGeo < 0 || iEnt < 0 || iMun < 0 || iLoc < 0) {
    throw new Error(
      `Cabecera incompleta. Índices: CVEGEO=${iGeo} CVE_ENT=${iEnt} CVE_MUN=${iMun} NOM_LOC=${iLoc}`,
    );
  }

  const out: ParsedRow[] = [];
  for (let r = headerIdx + 1; r < aoa.length; r++) {
    const row = aoa[r] as unknown[];
    if (!row || row.length === 0) continue;
    const cveEnt = String(row[iEnt] ?? '').trim();
    if (cveEnt !== '22') continue;

    const munRaw = String(row[iMun] ?? '').trim();
    const cveMun = parseInt(munRaw, 10);
    if (!Number.isFinite(cveMun) || cveMun < 1) continue;

    const cveGeo = claveFromCvegeo(row[iGeo]);
    if (!cveGeo) continue;

    const nomLoc = nombreLocalidad(row[iLoc]);
    if (!nomLoc || nomLoc === '(sin nombre)') continue;

    out.push({ cveEnt, cveMun, cveGeo, nomLoc });
  }
  return out;
}

/**
 * Lee un XLSX AGEEML (hoja Consulta o la primera) y devuelve filas para JSON de seed.
 * @param allowedCveMun Si se define, solo se incluyen localidades de esos CVE_MUN (numéricos, ej. 1–18).
 */
export function parseAgeemlXlsxToSeedRows(
  xlsxPath: string,
  allowedCveMun?: Set<number>,
): LocalidadQroAgeemlSeedRow[] {
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames.includes('Consulta') ? 'Consulta' : wb.SheetNames[0];
  if (!sheetName) throw new Error('El libro no contiene hojas.');
  const parsed = parseAgeemlSheet(wb.Sheets[sheetName]);
  const rows: LocalidadQroAgeemlSeedRow[] = [];
  for (const r of parsed) {
    if (allowedCveMun && !allowedCveMun.has(r.cveMun)) continue;
    rows.push({
      claveMunicipioINEGI: `22${String(r.cveMun).padStart(3, '0')}`,
      claveINEGI: r.cveGeo,
      nombre: r.nomLoc,
    });
  }
  return rows;
}
