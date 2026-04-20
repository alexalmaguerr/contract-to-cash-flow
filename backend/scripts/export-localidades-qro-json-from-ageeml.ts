/**
 * Genera `prisma/data/catalogo-localidades-qro-ageeml.json` desde un Excel AGEEML (INEGI).
 * Ejecutar solo en desarrollo (donde exista el .xlsx); el JSON resultante se versiona en git
 * y `prisma db seed` lo carga en cualquier entorno sin necesidad del Excel.
 *
 * Uso (desde backend/):
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/export-localidades-qro-json-from-ageeml.ts
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/export-localidades-qro-json-from-ageeml.ts -- --file "C:/ruta/AGEEML.xlsx"
 *
 * Variable: AGEEML_QRO_XLSX_PATH
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseAgeemlXlsxToSeedRows } from './lib/ageeml-qro-localidades';

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

function parseArgs(): { file?: string } {
  const argv = process.argv.slice(2);
  let file = process.env.AGEEML_QRO_XLSX_PATH?.trim();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' && argv[i + 1]) file = argv[++i];
  }
  return { file };
}

function main() {
  const { file: fileArg } = parseArgs();
  const backendRoot = path.join(__dirname, '..');
  const filePath = fileArg
    ? path.resolve(fileArg)
    : path.resolve(backendRoot, defaultAgeemlPath(backendRoot));

  if (!fs.existsSync(filePath)) {
    console.error('No existe el archivo:', filePath);
    console.error('Pase --file <ruta> o defina AGEEML_QRO_XLSX_PATH.');
    process.exit(1);
  }

  const outPath = path.join(backendRoot, 'prisma', 'data', 'catalogo-localidades-qro-ageeml.json');
  console.log('Leyendo:', filePath);
  const rows = parseAgeemlXlsxToSeedRows(filePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rows), 'utf8');
  console.log(`Escritas ${rows.length} filas en ${outPath}`);
}

main();
