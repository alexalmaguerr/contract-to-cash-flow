/**
 * Importa localidades de Querétaro (CVE_ENT 22) para los municipios ya cargados en BD,
 * usando el catálogo AGEEML (INEGI) exportado a Excel.
 *
 * Enlace territorial: **CVE_MUN** del AGEEML (001–018) = **proid** en
 * `prisma/data/catalogo-municipios-qro-sige.json` (columna `pro` / id municipal SIGE).
 *
 * El libro típico tiene una sola hoja **Consulta** con metadatos en las primeras filas;
 * la fila cuyo primer valor es `CVEGEO` se toma como cabecera de columnas.
 *
 * Clave única (`claveINEGI`): valor limpio de **CVEGEO** (9 dígitos, único por localidad).
 *
 * Uso (desde backend/):
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/import-localidades-sige-qro.ts
 *
 * Opciones:
 *   --file <ruta>     Ruta al XLSX AGEEML (por defecto: AGEEML bajo Contratos del repo).
 *   --wipe-qro-localidades   Borra localidades de municipios del estado 22 antes de insertar.
 *
 * Variables de entorno:
 *   AGEEML_QRO_XLSX_PATH — ruta al XLSX si no se pasa --file
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import type { WorkSheet } from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BATCH = 800;

type MunicipioQroRow = {
  proid: number;
  claveINEGI: string;
};

function parseArgs(): { file?: string; wipe: boolean } {
  const argv = process.argv.slice(2);
  let file = process.env.AGEEML_QRO_XLSX_PATH?.trim();
  let wipe = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' && argv[i + 1]) {
      file = argv[++i];
    } else if (argv[i] === '--wipe-qro-localidades') {
      wipe = true;
    }
  }
  return { file, wipe };
}

function defaultAgeemlPath(backendRoot: string): string {
  return path.join(
    backendRoot,
    '..',
    '_DocumentacIon_Interna_Sistema_Anterior',
    'Gestion Servicio',
    'Contratos',
    'AGEEML_2026419165655.xlsx',
  );
}

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

/** Localiza fila de cabecera (CVEGEO, CVE_ENT, …) en hoja «Consulta» tipo export INEGI */
function findHeaderRowIndex(aoa: unknown[][]): number {
  for (let i = 0; i < Math.min(30, aoa.length); i++) {
    const row = aoa[i];
    if (!Array.isArray(row) || row.length === 0) continue;
    if (String(row[0]).trim() === 'CVEGEO') return i;
  }
  return -1;
}

type ParsedAgeemlRow = {
  cveEnt: string;
  cveMun: number;
  cveGeo: string;
  nomLoc: string;
};

function parseAgeemlSheet(sheet: WorkSheet): ParsedAgeemlRow[] {
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

  const out: ParsedAgeemlRow[] = [];
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

async function main() {
  const { file: fileArg, wipe } = parseArgs();
  const backendRoot = path.join(__dirname, '..');
  const filePath = fileArg
    ? path.resolve(fileArg)
    : path.resolve(backendRoot, defaultAgeemlPath(backendRoot));

  if (!fs.existsSync(filePath)) {
    console.error('No existe el archivo:', filePath);
    console.error('Pase --file <ruta> o defina AGEEML_QRO_XLSX_PATH.');
    process.exit(1);
  }

  const munJsonPath = path.join(backendRoot, 'prisma', 'data', 'catalogo-municipios-qro-sige.json');
  if (!fs.existsSync(munJsonPath)) {
    console.error('Falta catálogo municipal QRO:', munJsonPath);
    process.exit(1);
  }

  const municipiosQro: MunicipioQroRow[] = JSON.parse(fs.readFileSync(munJsonPath, 'utf8'));
  const allowedProid = new Set(municipiosQro.map((m) => m.proid));

  const claves = [...new Set(municipiosQro.map((m) => m.claveINEGI))];
  const munDb = await prisma.catalogoMunicipioINEGI.findMany({
    where: { claveINEGI: { in: claves } },
    select: { id: true, claveINEGI: true },
  });

  const claveToId = new Map(munDb.map((m) => [m.claveINEGI, m.id]));
  const proidToMunicipioId = new Map<number, string>();
  for (const pr of municipiosQro) {
    const mid = claveToId.get(pr.claveINEGI);
    if (mid) proidToMunicipioId.set(pr.proid, mid);
    else console.warn(`Municipio no encontrado en BD para clave ${pr.claveINEGI} (${pr.proid}).`);
  }

  console.log(
    `Municipios QRO en BD resueltos: ${proidToMunicipioId.size}/${municipiosQro.length}`,
  );

  if (wipe) {
    const estado = await prisma.catalogoEstadoINEGI.findUnique({
      where: { claveINEGI: '22' },
      select: { id: true },
    });
    if (estado) {
      const del = await prisma.catalogoLocalidadINEGI.deleteMany({
        where: { municipio: { estadoId: estado.id } },
      });
      console.log(`Eliminadas localidades previas del estado Querétaro: ${del.count}`);
    } else {
      console.warn('No existe estado INEGI clave 22; no se eliminaron localidades.');
    }
  }

  console.log('Leyendo Excel AGEEML (puede tardar):', filePath);
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames.includes('Consulta')
    ? 'Consulta'
    : wb.SheetNames[0];
  if (!sheetName) {
    console.error('El libro no contiene hojas.');
    process.exit(1);
  }
  const rows = parseAgeemlSheet(wb.Sheets[sheetName]);
  console.log(`Filas de localidad (CVE_ENT=22) leídas: ${rows.length}`);

  let skippedNoMun = 0;
  let skippedProid = 0;
  let inserted = 0;

  let batch: { municipioId: string; claveINEGI: string; nombre: string; activo: boolean }[] = [];

  for (const row of rows) {
    if (!allowedProid.has(row.cveMun)) {
      skippedProid++;
      continue;
    }
    const municipioId = proidToMunicipioId.get(row.cveMun);
    if (!municipioId) {
      skippedNoMun++;
      continue;
    }

    batch.push({
      municipioId,
      claveINEGI: row.cveGeo,
      nombre: row.nomLoc,
      activo: true,
    });

    if (batch.length >= BATCH) {
      const r = await prisma.catalogoLocalidadINEGI.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += r.count;
      batch = [];
    }
  }

  if (batch.length) {
    const r = await prisma.catalogoLocalidadINEGI.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += r.count;
  }

  const total = await prisma.catalogoLocalidadINEGI.count();
  console.log(
    `Filas insertadas (nuevas): ${inserted}. Omitidas sin municipio en BD: ${skippedNoMun}. CVE_MUN fuera del catálogo SIGE QRO: ${skippedProid}. Total localidades en BD: ${total}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
