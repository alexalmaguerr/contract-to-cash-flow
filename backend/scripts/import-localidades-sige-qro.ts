/**
 * Importa localidades de Querétaro a la BD desde un Excel AGEEML (uso local / CI con el archivo presente).
 *
 * En producción el flujo esperado es: JSON versionado en `prisma/data/catalogo-localidades-qro-ageeml.json`
 * cargado por `seedInegiQueretaro` en `prisma db seed`. Regenerar ese JSON con:
 *   npm run export:localidades-qro-json
 *
 * Enlace: **CVE_MUN** (001–018) = **proid** en `catalogo-municipios-qro-sige.json`.
 * Clave localidad: **CVEGEO** (9 dígitos).
 *
 * Opciones:
 *   --file <ruta>     Ruta al XLSX AGEEML (por defecto bajo _DocumentacIon_Interna/... si existe).
 *   --wipe-qro-localidades   Borra localidades del estado 22 antes de insertar.
 *
 * Variables: AGEEML_QRO_XLSX_PATH
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseAgeemlXlsxToSeedRows } from './lib/ageeml-qro-localidades';

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

  console.log('Leyendo Excel AGEEML:', filePath);
  const seedRows = parseAgeemlXlsxToSeedRows(filePath, allowedProid);
  console.log(`Filas de localidad (CVE_ENT=22, CVE_MUN en catálogo): ${seedRows.length}`);

  let skippedNoMun = 0;
  let inserted = 0;

  let batch: { municipioId: string; claveINEGI: string; nombre: string; activo: boolean }[] = [];

  for (const row of seedRows) {
    const municipioId = claveToId.get(row.claveMunicipioINEGI);
    if (!municipioId) {
      skippedNoMun++;
      continue;
    }

    batch.push({
      municipioId,
      claveINEGI: row.claveINEGI,
      nombre: row.nombre,
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
    `Filas insertadas (nuevas): ${inserted}. Omitidas sin municipio en BD: ${skippedNoMun}. Total localidades en BD: ${total}.`,
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
