/**
 * Genera src/data/tarifas-contratacion.json desde los CSVs del escritorio.
 *
 * Fuentes:
 *   ~/Desktop/Tarifas_contratacion.xlsx - TARIFAS POR VARIABLES longitud..csv
 *   ~/Desktop/Tarifas_contratacion.xlsx - TARIFAS POR CONCEPTO FIJO.csv
 *
 * Ejecutar:
 *   node scripts/build-cotizacion-json.cjs
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const DESKTOP = path.join(os.homedir(), 'Desktop');

const CSV_LONGITUD  = path.join(DESKTOP, 'Tarifas_contratacion.xlsx - TARIFAS POR VARIABLES longitud..csv');
const CSV_MEDIDOR   = path.join(DESKTOP, 'Tarifas_contratacion.xlsx - TARIFAS POR VARIABLES diametro.csv');
const OUT_FILE      = path.join(__dirname, '..', 'src', 'data', 'tarifas-contratacion.json');

// ── CSV parser mínimo ────────────────────────────────────────────────────────

function parseCSV(filePath) {
  const text  = fs.readFileSync(filePath, 'utf-8');
  const lines = text.split('\n').map(l => l.trimEnd());

  // Encontrar línea de headers (contiene ADMINISTRACIÓN)
  const headerIdx = lines.findIndex(l => l.includes('ADMINISTRACIÓN'));
  if (headerIdx < 0) throw new Error(`No se encontró header en ${filePath}`);

  const headers = splitCSVLine(lines[headerIdx]);
  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    const cols = splitCSVLine(l);
    if (cols.length < headers.length) continue;
    const row = {};
    headers.forEach((h, j) => { row[h.trim()] = cols[j]?.trim() ?? ''; });
    rows.push(row);
  }
  return rows;
}

/** Divide una línea CSV respetando campos entre comillas. */
function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (c === ',' && !inQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

/** Limpia un string de precio: elimina $, espacios, comas → number. */
function parsePrecio(s) {
  if (!s) return 0;
  const clean = s.replace(/[$,\s]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

// ── 1. Parsear longitud CSV ───────────────────────────────────────────────────

const rowsLong = parseCSV(CSV_LONGITUD);

/*
  Estructura esperada por fila:
    ADMINISTRACIÓN  CONCEPTO                                      VARIABLE  TARIFA (= matCalle-matBanqueta)
    TASA  PRECIO BASE  PRECIO PROPORCIONAL  cantidad  FÓRMULA
*/

const longitud = {}; // { [admin]: { agua: { [tarifa]: {pb,pp,tasa} }, drenaje: { ... } } }

for (const r of rowsLong) {
  const admin    = r['ADMINISTRACIÓN']?.trim().toUpperCase();
  const concepto = r['CONCEPTO']?.trim().toUpperCase();
  const tarifa   = r['TARIFA']?.trim().toUpperCase().replace(/\s+/g, '');
  const tasa     = parseFloat(r['TASA']) || 0;
  const pb       = parsePrecio(r['PRECIO BASE']);
  const pp       = parsePrecio(r['PRECIO PROPORCIONAL']);

  if (!admin || !concepto || !tarifa) continue;

  let tipo;
  if (concepto.includes('RED DE AGUA')) tipo = 'agua';
  else if (concepto.includes('DRENAJE')) tipo = 'drenaje';
  else continue; // otro concepto

  longitud[admin]       ??= { agua: {}, drenaje: {} };
  longitud[admin][tipo] ??= {};
  longitud[admin][tipo][tarifa] = { precioBase: pb, precioProporcional: pp, tasa };
}

// ── 2. Parsear medidor CSV ───────────────────────────────────────────────────

const rowsMed = parseCSV(CSV_MEDIDOR);

/*
  CONCEPTO: INSTALACIÓN DE MEDIDOR (CONTRATACIÓN)  o  MEDIDOR(CONTRATACIÓN)
  VARIABLE: descripción del diámetro / tipo
  PRECIO BASE: precio fijo (precio proporcional = 0)
*/

const medidor = {}; // { [admin]: { instalacion: { [diametroKey]: {precio,tasa} }, medidor: { [varKey]: {precio,tasa} } } }

// Mapeo de VARIABLE → clave normalizada para instalación
function normalizarVariableInstalacion(variable) {
  const v = variable.toUpperCase();
  if (v.includes('1/2') && v.includes('3/4') && v.includes('1 PULG')) return '1/2-3/4-1';
  if (v.includes('2 PULG')) return '2';
  if (v.includes('3 PULG')) return '3';
  if (v.includes('4 PULG')) return '4';
  return null;
}

function normalizarVariableMedidor(variable) {
  const v = variable.toUpperCase();
  // Velocidad 1/2
  if (v.includes('VELOCIDAD') && v.includes('1/2')) {
    if (v.includes('24')) return 'velocidad_1/2_24parc';
    if (v.includes('12')) return 'velocidad_1/2_12parc';
    if (v.includes('CONTADO')) return 'velocidad_1/2_contado';
  }
  // Volumétrico 1/2
  if (v.includes('VOLUMÉTRICO') || v.includes('VOLUMETRICO')) {
    if (v.includes('3/4')) return null; // $0.01 — no estándar, omitir
    if (v.includes('12')) return 'volumetrico_1/2_12parc';
    if (v.includes('CONTADO')) return 'volumetrico_1/2_contado';
  }
  // "Mayor que 1/2" → $0.01 placeholder, omitir
  if (v.includes('MAYOR')) return null;
  return null;
}

for (const r of rowsMed) {
  const admin    = r['ADMINISTRACIÓN']?.trim().toUpperCase();
  const concepto = r['CONCEPTO']?.trim().toUpperCase();
  const variable = r['VARIABLE']?.trim() ?? '';
  const tasa     = parseFloat(r['TASA']) || 0;
  const precio   = parsePrecio(r['PRECIO BASE']);

  if (!admin || !concepto) continue;
  medidor[admin] ??= { instalacion: {}, medidorTipos: {} };

  if (concepto.includes('INSTALACIÓN DE MEDIDOR')) {
    const key = normalizarVariableInstalacion(variable);
    if (key) medidor[admin].instalacion[key] = { precio, tasa };
  } else if (concepto.includes('MEDIDOR(CONTRATACI') || concepto.includes('MEDIDOR (CONTRATACI')) {
    const key = normalizarVariableMedidor(variable);
    if (key) medidor[admin].medidorTipos[key] = { precio, tasa };
  }
}

// ── 3. Merge y guardar ────────────────────────────────────────────────────────

// Asegurar que todos los admins de longitud estén en medidor y viceversa
const allAdmins = new Set([...Object.keys(longitud), ...Object.keys(medidor)]);
const output = {};
for (const admin of allAdmins) {
  output[admin] = {
    longitud: longitud[admin] ?? { agua: {}, drenaje: {} },
    medidor:  medidor[admin]  ?? { instalacion: {}, medidorTipos: {} },
  };
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

// Estadísticas
console.log('\n✅ tarifas-contratacion.json generado');
console.log(`   Admins: ${allAdmins.size}`);
for (const [admin, data] of Object.entries(output)) {
  const nAgua    = Object.keys(data.longitud.agua).length;
  const nDrenaje = Object.keys(data.longitud.drenaje).length;
  const nInst    = Object.keys(data.medidor.instalacion).length;
  const nMed     = Object.keys(data.medidor.medidorTipos).length;
  console.log(`   ${admin}: agua=${nAgua} drenaje=${nDrenaje} inst=${nInst} medTipos=${nMed}`);
}
console.log('');
