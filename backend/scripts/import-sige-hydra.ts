/**
 * Importa datos del Excel "relacion contrato SIGE.xlsx" a la tabla sige_hydra.
 * Solo importa filas con datos en AMBAS columnas (cnttnum y cnttrefant).
 * Uso: npx ts-node scripts/import-sige-hydra.ts "ruta/al/archivo.xlsx"
 */

import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';

const prisma = new PrismaClient();

const BATCH_SIZE = 2000;

function str(val: unknown): string {
  if (val == null) return '';
  return String(val).trim();
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      'Uso: npx ts-node scripts/import-sige-hydra.ts "ruta/al/archivo.xlsx"',
    );
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  console.log('Leyendo:', resolvedPath);
  const workbook = XLSX.readFile(resolvedPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
  }) as unknown[][];

  if (rows.length < 2) {
    console.error('El archivo no tiene datos (solo cabecera o vacío)');
    process.exit(1);
  }

  const dataRows = rows.slice(1) as unknown[][];
  const col = (row: unknown[], idx: number) =>
    row[idx] != null ? row[idx] : '';

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  const validRows: { cnttnum: string; cnttrefant: string }[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const cnttnum = str(col(row, 0));
    const cnttrefant = str(col(row, 1));

    if (!cnttnum || !cnttrefant) {
      skipped++;
      continue;
    }

    validRows.push({ cnttnum, cnttrefant });
  }

  console.log(
    `Filas válidas: ${validRows.length}, omitidas (sin ambas columnas): ${skipped}`,
  );

  const contratoCache = new Map<string, string | null>();

  for (let b = 0; b < validRows.length; b += BATCH_SIZE) {
    const batch = validRows.slice(b, b + BATCH_SIZE);

    for (const { cnttnum, cnttrefant } of batch) {
      let contratoId: string | null;
      if (contratoCache.has(cnttrefant)) {
        contratoId = contratoCache.get(cnttrefant)!;
      } else {
        const contrato = await prisma.contrato.findFirst({
          where: { ceaNumContrato: cnttrefant },
          select: { id: true },
        });
        contratoId = contrato?.id ?? null;
        contratoCache.set(cnttrefant, contratoId);
      }

      try {
        const existing = await prisma.sigeHydra.findUnique({
          where: { cnttnum },
        });

        await prisma.sigeHydra.upsert({
          where: { cnttnum },
          create: { cnttnum, cnttrefant, contratoId },
          update: { cnttrefant, contratoId },
        });

        if (existing) updated++;
        else imported++;
      } catch (err) {
        console.error(`Error en cnttnum=${cnttnum}:`, err);
      }
    }

    if ((b + BATCH_SIZE) % 10000 === 0 || b + BATCH_SIZE >= validRows.length) {
      console.log(`Procesadas ${Math.min(b + BATCH_SIZE, validRows.length)} / ${validRows.length}`);
    }
  }

  console.log(
    `Listo. Importados: ${imported}, Actualizados: ${updated}, Omitidos: ${skipped}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
