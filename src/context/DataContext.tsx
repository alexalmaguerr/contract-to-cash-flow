import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type FactibilidadEstado = 'Pre-factibilidad' | 'En comité' | 'Aprobada' | 'Rechazada';
export type ConstruccionEstado = 'Planeación' | 'En proceso' | 'Finalizada';
export type TomaEstado = 'Disponible' | 'Asignada';
export type ContratoEstado = 'Pendiente de alta' | 'Activo' | 'Suspendido' | 'Cancelado';
export type MedidorEstado = 'Activo' | 'Inactivo';
export type MedidorBodegaEstado = 'Disponible' | 'En reparación';

export interface MedidorBodega {
  id: string;
  serie: string;
  /** Zona no se asigna en inventario; solo al unir medidor con contrato. */
  zonaId?: string;
  estado: MedidorBodegaEstado;
}
export type LecturaEstado = 'Válida' | 'No válida' | 'Pendiente';
export type PreFacturaEstado = 'Pendiente' | 'Validada' | 'Aceptada';
export type TimbradoEstado = 'Timbrada OK' | 'Error PAC' | 'Pendiente';

export interface Factibilidad {
  id: string;
  predio: string;
  solicitante: string;
  direccion: string;
  estado: FactibilidadEstado;
  fecha: string;
  notas: string;
}

export interface Construccion {
  id: string;
  factibilidadId: string;
  nombre: string;
  ubicacion: string;
  estado: ConstruccionEstado;
  fecha: string;
}

export interface Toma {
  id: string;
  construccionId: string;
  ubicacion: string;
  tipo: 'Agua' | 'Saneamiento' | 'Alcantarillado';
  estado: TomaEstado;
}

export interface Administracion {
  id: string;
  nombre: string;
  zonaIds: string[];
}

export interface Zona {
  id: string;
  administracionId: string;
  nombre: string;
  distritoIds: string[];
}

export interface Distrito {
  id: string;
  zonaId: string;
  nombre: string;
}

/** Usuario actual (mock para accesos por administración/zona) */
export interface CurrentUser {
  id: string;
  name: string;
  administracionIds: string[];
  zonaIds: string[];
}

export interface Contrato {
  id: string;
  tomaId: string;
  tipoContrato: 'Agua' | 'Saneamiento' | 'Alcantarillado';
  tipoServicio: 'Doméstico' | 'Comercial' | 'Industrial';
  nombre: string;
  rfc: string;
  direccion: string;
  contacto: string;
  estado: ContratoEstado;
  fecha: string;
  medidorId?: string;
  rutaId?: string;
  zonaId?: string;
}

export interface Medidor {
  id: string;
  contratoId: string;
  serie: string;
  estado: MedidorEstado;
  cobroDiferido: boolean;
  lecturaInicial: number;
}

export interface Ruta {
  id: string;
  zonaId: string;
  distritoId?: string;
  zona?: string; // display name, derivable from Zona
  sector: string;
  libreta: string;
  lecturista: string;
  contratoIds: string[];
}

export interface Lectura {
  id: string;
  contratoId: string;
  rutaId: string;
  lecturaAnterior: number;
  lecturaActual: number;
  consumo: number;
  estado: LecturaEstado;
  incidencia: string;
  fecha: string;
  periodo: string;
  /** Límite mínimo de consumo para la zona (m³) */
  lecturaMinZona?: number;
  /** Límite máximo de consumo para la zona (m³) */
  lecturaMaxZona?: number;
  /** Simulado mensual o mínimo de zona cuando la lectura no es válida */
  simuladoMensual?: number;
  /** Motivo de invalidación cuando estado es No válida */
  motivoInvalidacion?: string;
}

export interface Consumo {
  id: string;
  contratoId: string;
  lecturaId: string;
  tipo: 'Real' | 'Promedio histórico' | 'Mixto' | 'Consumo fijo';
  m3: number;
  periodo: string;
  confirmado: boolean;
}

export interface Tarifa {
  id: string;
  tipo: 'Doméstico' | 'Comercial' | 'Industrial';
  rangoMin: number;
  rangoMax: number;
  precioPorM3: number;
  cargoFijo: number;
}

export interface Descuento {
  id: string;
  nombre: string;
  tipo: 'Jubilado' | 'Pensionado' | 'Usuario cumplido' | 'Pago anticipado' | 'Extraordinario';
  porcentaje: number;
  activo: boolean;
}

export interface PreFactura {
  id: string;
  contratoId: string;
  periodo: string;
  consumoM3: number;
  subtotal: number;
  descuento: number;
  total: number;
  estado: PreFacturaEstado;
}

export interface Timbrado {
  id: string;
  preFacturaId: string;
  contratoId: string;
  uuid: string;
  estado: TimbradoEstado;
  error?: string;
  fecha: string;
}

/** Cuota de pago en parcialidades (contrato con pago diferido) */
export interface PagoParcialidad {
  id: string;
  contratoId: string;
  numero: number;
  monto: number;
  fechaVencimiento: string;
  estado: 'Pendiente' | 'Pagado';
}

export interface Recibo {
  id: string;
  timbradoId: string;
  contratoId: string;
  saldoVigente: number;
  saldoVencido: number;
  parcialidades: number;
  fechaVencimiento: string;
  impreso: boolean;
  mensajeIndividual?: string;
}

export type TipoPago =
  | 'Efectivo' | 'Transferencia' | 'Tarjeta'
  | 'SPEI' | 'OXXO' | 'CODI' | 'CAJERO' | 'CHATBOT' | 'WEB' | 'CAJAS POPULARES' | 'Link de pago';

export interface Pago {
  id: string;
  contratoId: string;
  monto: number;
  fecha: string;
  tipo: TipoPago;
  concepto: string;
  /** 'nativo' = aplicado en sistema; 'externo' = recaudación externa por conciliar */
  origen?: 'nativo' | 'externo';
}

/** Pago de recaudación externa (webservice) por conciliar */
export interface PagoExterno {
  id: string;
  referencia: string;
  monto: number;
  fecha: string;
  tipo: TipoPago;
  estado: 'pendiente_conciliar' | 'conciliado';
  contratoIdSugerido?: string;
  facturaIdSugerido?: string;
  concepto?: string;
}

// Initial mock data
const initialFactibilidades: Factibilidad[] = [
  { id: 'F001', predio: 'Lote 23-A Juriquilla', solicitante: 'Carlos Mendoza', direccion: 'Av. Juriquilla 450', estado: 'Aprobada', fecha: '2025-01-15', notas: 'Zona con infraestructura disponible' },
  { id: 'F002', predio: 'Manzana 5 El Marqués', solicitante: 'María López', direccion: 'Calle Norte 120', estado: 'En comité', fecha: '2025-02-01', notas: 'Pendiente dictamen técnico' },
  { id: 'F003', predio: 'Parcela 8 Corregidora', solicitante: 'Roberto Sánchez', direccion: 'Blvd. Corregidora 890', estado: 'Pre-factibilidad', fecha: '2025-02-10', notas: '' },
  { id: 'F004', predio: 'Condominio Zibatá', solicitante: 'Inmobiliaria Norte SA', direccion: 'Circuito Zibatá 200', estado: 'Rechazada', fecha: '2024-12-05', notas: 'Sin capacidad en red' },
];

const initialConstrucciones: Construccion[] = [
  { id: 'C001', factibilidadId: 'F001', nombre: 'Red hidráulica Juriquilla Ph2', ubicacion: 'Juriquilla', estado: 'Finalizada', fecha: '2025-01-20' },
  { id: 'C002', factibilidadId: 'F001', nombre: 'Alcantarillado Juriquilla Ph2', ubicacion: 'Juriquilla', estado: 'En proceso', fecha: '2025-02-01' },
];

const initialTomas: Toma[] = [
  { id: 'T001', construccionId: 'C001', ubicacion: 'Juriquilla Lote 23-A #1', tipo: 'Agua', estado: 'Asignada' },
  { id: 'T002', construccionId: 'C001', ubicacion: 'Juriquilla Lote 23-A #2', tipo: 'Agua', estado: 'Disponible' },
  { id: 'T003', construccionId: 'C001', ubicacion: 'Juriquilla Lote 23-A #3', tipo: 'Saneamiento', estado: 'Disponible' },
  { id: 'T004', construccionId: 'C001', ubicacion: 'Juriquilla Lote 23-A #4', tipo: 'Alcantarillado', estado: 'Disponible' },
];

// Seed territorial (Fase 1+2): Administraciones → Zonas → Distritos
const initialDistritos: Distrito[] = [
  { id: 'DIST01', zonaId: 'Z001', nombre: 'Juriquilla Centro' },
  { id: 'DIST02', zonaId: 'Z001', nombre: 'Juriquilla Norte' },
  { id: 'DIST03', zonaId: 'Z002', nombre: 'El Marqués Sur' },
  { id: 'DIST04', zonaId: 'Z002', nombre: 'El Marqués Norte' },
  { id: 'DIST05', zonaId: 'Z003', nombre: 'Corregidora Centro' },
  { id: 'DIST06', zonaId: 'Z003', nombre: 'Corregidora Oriente' },
  { id: 'DIST07', zonaId: 'Z004', nombre: 'Zibatá Residencial' },
  { id: 'DIST08', zonaId: 'Z005', nombre: 'Centro Histórico' },
];
const initialZonas: Zona[] = [
  { id: 'Z001', administracionId: 'ADM01', nombre: 'Norte', distritoIds: ['DIST01', 'DIST02'] },
  { id: 'Z002', administracionId: 'ADM01', nombre: 'El Marqués', distritoIds: ['DIST03', 'DIST04'] },
  { id: 'Z003', administracionId: 'ADM01', nombre: 'Corregidora', distritoIds: ['DIST05', 'DIST06'] },
  { id: 'Z004', administracionId: 'ADM02', nombre: 'Zibatá', distritoIds: ['DIST07'] },
  { id: 'Z005', administracionId: 'ADM02', nombre: 'Centro', distritoIds: ['DIST08'] },
];
const initialAdministraciones: Administracion[] = [
  { id: 'ADM01', nombre: 'CEA Querétaro', zonaIds: ['Z001', 'Z002', 'Z003'] },
  { id: 'ADM02', nombre: 'Operadora Zibatá', zonaIds: ['Z004', 'Z005'] },
];

const initialContratos: Contrato[] = [
  { id: 'CT001', tomaId: 'T001', tipoContrato: 'Agua', tipoServicio: 'Doméstico', nombre: 'Juan Pérez García', rfc: 'PEGJ800101XXX', direccion: 'Juriquilla Lote 23-A #1', contacto: '442-111-2233', estado: 'Activo', fecha: '2025-01-25', medidorId: 'M001', rutaId: 'R001', zonaId: 'Z001' },
  { id: 'CT002', tomaId: 'T002', tipoContrato: 'Agua', tipoServicio: 'Doméstico', nombre: 'María López', rfc: 'LOM850202YYY', direccion: 'Juriquilla Lote 23-A #2', contacto: '442-222-3344', estado: 'Activo', fecha: '2025-01-26', medidorId: 'M002', rutaId: 'R001', zonaId: 'Z001' },
  { id: 'CT003', tomaId: 'T003', tipoContrato: 'Saneamiento', tipoServicio: 'Comercial', nombre: 'Comercial Norte SA', rfc: 'NSA900101ZZZ', direccion: 'Juriquilla Lote 23-A #3', contacto: '442-333-4455', estado: 'Activo', fecha: '2025-01-27', medidorId: 'M003', rutaId: 'R002', zonaId: 'Z002' },
];

const initialMedidoresBodega: MedidorBodega[] = [
  { id: 'MB001', serie: 'MED-2025-00010', zonaId: 'Z001', estado: 'Disponible' },
  { id: 'MB002', serie: 'MED-2025-00011', zonaId: 'Z001', estado: 'Disponible' },
  { id: 'MB003', serie: 'MED-2025-00012', zonaId: 'Z002', estado: 'En reparación' },
  { id: 'MB004', serie: 'MED-2025-00013', zonaId: 'Z001', estado: 'Disponible' },
];

const initialMedidores: Medidor[] = [
  { id: 'M001', contratoId: 'CT001', serie: 'MED-2025-00001', estado: 'Activo', cobroDiferido: false, lecturaInicial: 0 },
  { id: 'M002', contratoId: 'CT002', serie: 'MED-2025-00002', estado: 'Activo', cobroDiferido: false, lecturaInicial: 10 },
  { id: 'M003', contratoId: 'CT003', serie: 'MED-2025-00003', estado: 'Activo', cobroDiferido: false, lecturaInicial: 0 },
];

const initialRutas: Ruta[] = [
  { id: 'R001', zonaId: 'Z001', sector: 'Juriquilla', libreta: 'LIB-001', lecturista: 'Pedro Ramírez', contratoIds: ['CT001', 'CT002'] },
  { id: 'R002', zonaId: 'Z002', sector: 'El Marqués', libreta: 'LIB-002', lecturista: 'Ana García', contratoIds: ['CT003'] },
];

// Seed lecturas: muchas lecturas con mix válidas/no válidas y datos de validación (Fase 5)
function generateSeedLecturas(): Lectura[] {
  const out: Lectura[] = [];
  const contratosRutas: { contratoId: string; rutaId: string }[] = [
    { contratoId: 'CT001', rutaId: 'R001' },
    { contratoId: 'CT002', rutaId: 'R001' },
    { contratoId: 'CT003', rutaId: 'R002' },
  ];
  const minZona = 0;
  const maxZona = 200;
  const prevByContrato: Record<string, number> = { CT001: 0, CT002: 10, CT003: 0 };
  let id = 1;
  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === 2025 && month > 2) break;
      const periodo = `${year}-${String(month).padStart(2, '0')}`;
      const fecha = `${year}-${String(month).padStart(2, '0')}-15`;
      for (const { contratoId, rutaId } of contratosRutas) {
        const prev = prevByContrato[contratoId];
        const consumo = Math.floor(Math.random() * 80) + 5;
        const actual = prev + consumo;
        const fueraMin = consumo < 0;
        const fueraMax = consumo > maxZona;
        const noValida = Math.random() < 0.25 || fueraMin || fueraMax;
        const estado: LecturaEstado = noValida ? 'No válida' : (Math.random() < 0.1 ? 'Pendiente' : 'Válida');
        const motivo = noValida ? (fueraMax ? 'Excede máximo zona' : fueraMin ? 'Bajo mínimo' : 'Fuera de rango') : undefined;
        out.push({
          id: `L${String(id).padStart(3, '0')}`,
          contratoId,
          rutaId,
          lecturaAnterior: prev,
          lecturaActual: actual,
          consumo,
          estado,
          incidencia: motivo || '',
          fecha,
          periodo,
          lecturaMinZona: minZona,
          lecturaMaxZona: maxZona,
          simuladoMensual: noValida ? Math.min(consumo, 50) : undefined,
          motivoInvalidacion: motivo,
        });
        prevByContrato[contratoId] = actual;
        id++;
      }
    }
  }
  return out;
}
const initialLecturas: Lectura[] = generateSeedLecturas();

// Seed consumos: a partir de lecturas y periodos (Fase 7)
function generateSeedConsumos(): Consumo[] {
  const out: Consumo[] = [];
  const periodos = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'];
  const contratos = ['CT001', 'CT002', 'CT003'];
  let id = 1;
  for (const periodo of periodos) {
    for (const contratoId of contratos) {
      const m3 = Math.floor(Math.random() * 35) + 8;
      const tipo = Math.random() < 0.7 ? 'Real' : (Math.random() < 0.5 ? 'Promedio histórico' : 'Mixto');
      out.push({
        id: `CO${String(id).padStart(3, '0')}`,
        contratoId,
        lecturaId: '',
        tipo: tipo as 'Real' | 'Promedio histórico' | 'Mixto' | 'Consumo fijo',
        m3,
        periodo,
        confirmado: Math.random() < 0.85,
      });
      id++;
    }
  }
  return out;
}
const initialConsumos: Consumo[] = generateSeedConsumos();

const initialTarifas: Tarifa[] = [
  { id: 'TAR001', tipo: 'Doméstico', rangoMin: 0, rangoMax: 10, precioPorM3: 8.50, cargoFijo: 45 },
  { id: 'TAR002', tipo: 'Doméstico', rangoMin: 11, rangoMax: 30, precioPorM3: 14.20, cargoFijo: 45 },
  { id: 'TAR003', tipo: 'Doméstico', rangoMin: 31, rangoMax: 999, precioPorM3: 22.00, cargoFijo: 45 },
  { id: 'TAR004', tipo: 'Comercial', rangoMin: 0, rangoMax: 20, precioPorM3: 18.50, cargoFijo: 120 },
  { id: 'TAR005', tipo: 'Comercial', rangoMin: 21, rangoMax: 999, precioPorM3: 28.00, cargoFijo: 120 },
  { id: 'TAR006', tipo: 'Industrial', rangoMin: 0, rangoMax: 999, precioPorM3: 35.00, cargoFijo: 250 },
];

const initialDescuentos: Descuento[] = [
  { id: 'D001', nombre: 'Jubilado / Pensionado', tipo: 'Jubilado', porcentaje: 50, activo: true },
  { id: 'D002', nombre: 'Usuario cumplido', tipo: 'Usuario cumplido', porcentaje: 10, activo: true },
  { id: 'D003', nombre: 'Pago anticipado', tipo: 'Pago anticipado', porcentaje: 5, activo: true },
];

// Seed facturas: PreFacturas + Timbrados + Recibos (Fase 7)
function generateSeedFacturas(): { preFacturas: PreFactura[]; timbrados: Timbrado[]; recibos: Recibo[] } {
  const preFacturas: PreFactura[] = [];
  const timbrados: Timbrado[] = [];
  const recibos: Recibo[] = [];
  const contratos = ['CT001', 'CT002', 'CT003'];
  const periodos = ['2024-10', '2024-11', '2024-12', '2025-01'];
  let pfId = 1;
  let tmId = 1;
  let rbId = 1;
  for (const periodo of periodos) {
    for (const contratoId of contratos) {
      const consumoM3 = Math.floor(Math.random() * 30) + 10;
      const subtotal = consumoM3 * 14;
      const total = subtotal + 45;
      const estado: PreFacturaEstado = pfId % 3 === 0 ? 'Pendiente' : (pfId % 3 === 1 ? 'Validada' : 'Aceptada');
      const pf = {
        id: `PF${String(pfId).padStart(3, '0')}`,
        contratoId,
        periodo,
        consumoM3,
        subtotal,
        descuento: 0,
        total,
        estado,
      };
      preFacturas.push(pf);
      if (estado === 'Aceptada') {
        const tId = `TM${String(tmId).padStart(3, '0')}`;
        const uuid = `UUID-${Date.now()}-${tmId}`;
        timbrados.push({
          id: tId,
          preFacturaId: pf.id,
          contratoId,
          uuid,
          estado: 'Timbrada OK',
          fecha: `${periodo}-28`,
        });
        const nextMonth = (Number(periodo.slice(5)) % 12) + 1;
        const nextYear = nextMonth === 1 ? Number(periodo.slice(0, 4)) + 1 : Number(periodo.slice(0, 4));
        recibos.push({
          id: `RB${String(rbId).padStart(3, '0')}`,
          timbradoId: tId,
          contratoId,
          saldoVigente: total,
          saldoVencido: rbId % 3 === 0 ? Math.floor(total * 0.3) : 0,
          parcialidades: 0,
          fechaVencimiento: `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`,
          impreso: rbId % 2 === 0,
        });
        tmId++;
        rbId++;
      }
      pfId++;
    }
  }
  return { preFacturas, timbrados, recibos };
}
const seedFacturas = generateSeedFacturas();
const initialPreFacturas: PreFactura[] = seedFacturas.preFacturas;
const initialTimbrados: Timbrado[] = seedFacturas.timbrados;
const initialRecibos: Recibo[] = seedFacturas.recibos;

const initialPagosParcialidad: PagoParcialidad[] = [
  { id: 'PP001', contratoId: 'CT001', numero: 1, monto: 150, fechaVencimiento: '2025-03-15', estado: 'Pendiente' },
  { id: 'PP002', contratoId: 'CT001', numero: 2, monto: 150, fechaVencimiento: '2025-04-15', estado: 'Pendiente' },
  { id: 'PP003', contratoId: 'CT001', numero: 3, monto: 150, fechaVencimiento: '2025-05-15', estado: 'Pendiente' },
  { id: 'PP004', contratoId: 'CT002', numero: 1, monto: 200, fechaVencimiento: '2025-03-20', estado: 'Pagado' },
  { id: 'PP005', contratoId: 'CT002', numero: 2, monto: 200, fechaVencimiento: '2025-04-20', estado: 'Pendiente' },
];

const initialPagosExternos: PagoExterno[] = [
  { id: 'EX001', referencia: 'REF-OXXO-2025-001', monto: 450, fecha: '2025-02-10', tipo: 'OXXO', estado: 'pendiente_conciliar', contratoIdSugerido: 'CT001', concepto: 'Pago OXXO' },
  { id: 'EX002', referencia: 'REF-SPEI-2025-002', monto: 320, fecha: '2025-02-11', tipo: 'SPEI', estado: 'pendiente_conciliar', contratoIdSugerido: 'CT002', concepto: 'Transferencia' },
  { id: 'EX003', referencia: 'REF-WEB-2025-003', monto: 180, fecha: '2025-02-12', tipo: 'WEB', estado: 'pendiente_conciliar', concepto: 'Pago web sin asignar' },
  { id: 'EX004', referencia: 'REF-CODI-2025-004', monto: 275, fecha: '2025-02-13', tipo: 'CODI', estado: 'conciliado', contratoIdSugerido: 'CT003' },
];

const initialPagos: Pago[] = [
  { id: 'P001', contratoId: 'CT001', monto: 172.00, fecha: '2025-01-30', tipo: 'Efectivo', concepto: 'Pago servicio enero 2025', origen: 'nativo' },
  { id: 'P002', contratoId: 'CT001', monto: 250, fecha: '2025-02-05', tipo: 'Link de pago', concepto: 'Pago en línea', origen: 'nativo' },
];

interface DataContextType {
  factibilidades: Factibilidad[];
  construcciones: Construccion[];
  tomas: Toma[];
  contratos: Contrato[];
  medidores: Medidor[];
  rutas: Ruta[];
  lecturas: Lectura[];
  consumos: Consumo[];
  tarifas: Tarifa[];
  descuentos: Descuento[];
  preFacturas: PreFactura[];
  timbrados: Timbrado[];
  recibos: Recibo[];
  pagos: Pago[];
  administraciones: Administracion[];
  zonas: Zona[];
  distritos: Distrito[];
  medidoresBodega: MedidorBodega[];
  currentUser: CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;
  allowedZonaIds: string[] | null;
  /** Mensaje global para recibos de impresión (antes de enviar a timbrar) */
  mensajeGlobalRecibos: string;
  setMensajeGlobalRecibos: (msg: string) => void;
  pagosParcialidad: PagoParcialidad[];
  addPagoParcialidad: (p: Omit<PagoParcialidad, 'id'>) => void;
  updatePagoParcialidad: (id: string, updates: Partial<PagoParcialidad>) => void;
  pagosExternos: PagoExterno[];
  addPagoExterno: (p: Omit<PagoExterno, 'id'>) => void;
  updatePagoExterno: (id: string, updates: Partial<PagoExterno>) => void;
  conciliarPagoExterno: (id: string, contratoId: string) => void;
  // Actions
  addFactibilidad: (f: Omit<Factibilidad, 'id'>) => void;
  updateFactibilidad: (id: string, updates: Partial<Factibilidad>) => void;
  addConstruccion: (c: Omit<Construccion, 'id'>) => void;
  updateConstruccion: (id: string, updates: Partial<Construccion>) => void;
  addToma: (t: Omit<Toma, 'id'>) => void;
  updateToma: (id: string, updates: Partial<Toma>) => void;
  addContrato: (c: Omit<Contrato, 'id'>) => void;
  updateContrato: (id: string, updates: Partial<Contrato>) => void;
  addMedidor: (m: Omit<Medidor, 'id'>) => void;
  updateMedidor: (id: string, updates: Partial<Medidor>) => void;
  addMedidorBodega: (m: Omit<MedidorBodega, 'id'>) => void;
  updateMedidorBodega: (id: string, updates: Partial<MedidorBodega>) => void;
  removeMedidorBodega: (id: string) => void;
  assignMedidorFromBodega: (medidorBodegaId: string, contratoId: string, lecturaInicial: number, zonaId: string) => void;
  addRuta: (r: Omit<Ruta, 'id'>) => void;
  updateRuta: (id: string, updates: Partial<Ruta>) => void;
  moveContratoToRuta: (contratoId: string, rutaId: string | null) => void;
  addLectura: (l: Omit<Lectura, 'id'>) => void;
  updateLectura: (id: string, updates: Partial<Lectura>) => void;
  addConsumo: (c: Omit<Consumo, 'id'>) => void;
  updateConsumo: (id: string, updates: Partial<Consumo>) => void;
  addPreFactura: (p: Omit<PreFactura, 'id'>) => void;
  updatePreFactura: (id: string, updates: Partial<PreFactura>) => void;
  addTimbrado: (t: Omit<Timbrado, 'id'>) => void;
  updateTimbrado: (id: string, updates: Partial<Timbrado>) => void;
  addRecibo: (r: Omit<Recibo, 'id'>) => void;
  updateRecibo: (id: string, updates: Partial<Recibo>) => void;
  addPago: (p: Omit<Pago, 'id'>) => void;
  addAdministracion: (a: Omit<Administracion, 'id'>) => void;
  updateAdministracion: (id: string, updates: Partial<Administracion>) => void;
  addZona: (z: Omit<Zona, 'id'>) => void;
  updateZona: (id: string, updates: Partial<Zona>) => void;
  addDistrito: (d: Omit<Distrito, 'id'>) => void;
  updateDistrito: (id: string, updates: Partial<Distrito>) => void;
  calcularTarifa: (tipoServicio: string, m3: number) => { subtotal: number; cargoFijo: number; total: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

let counter = 100;
const genId = (prefix: string) => `${prefix}${String(++counter).padStart(3, '0')}`;

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [factibilidades, setFactibilidades] = useState(initialFactibilidades);
  const [construcciones, setConstrucciones] = useState(initialConstrucciones);
  const [tomas, setTomas] = useState(initialTomas);
  const [contratos, setContratos] = useState(initialContratos);
  const [medidores, setMedidores] = useState(initialMedidores);
  const [medidoresBodega, setMedidoresBodega] = useState(initialMedidoresBodega);
  const [rutas, setRutas] = useState(initialRutas);
  const [lecturas, setLecturas] = useState(initialLecturas);
  const [consumos, setConsumos] = useState(initialConsumos);
  const [tarifas] = useState(initialTarifas);
  const [descuentos] = useState(initialDescuentos);
  const [preFacturas, setPreFacturas] = useState(initialPreFacturas);
  const [timbrados, setTimbrados] = useState(initialTimbrados);
  const [recibos, setRecibos] = useState(initialRecibos);
  const [pagos, setPagos] = useState(initialPagos);
  const [administraciones, setAdministraciones] = useState(initialAdministraciones);
  const [zonas, setZonas] = useState(initialZonas);
  const [distritos, setDistritos] = useState(initialDistritos);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const allowedZonaIds = currentUser?.zonaIds ?? null;
  const [mensajeGlobalRecibos, setMensajeGlobalRecibos] = useState('');
  const [pagosParcialidad, setPagosParcialidad] = useState(initialPagosParcialidad);
  const [pagosExternos, setPagosExternos] = useState(initialPagosExternos);

  const addFactibilidad = (f: Omit<Factibilidad, 'id'>) => setFactibilidades(prev => [...prev, { ...f, id: genId('F') }]);
  const updateFactibilidad = (id: string, updates: Partial<Factibilidad>) => setFactibilidades(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

  const addConstruccion = (c: Omit<Construccion, 'id'>) => setConstrucciones(prev => [...prev, { ...c, id: genId('C') }]);
  const updateConstruccion = (id: string, updates: Partial<Construccion>) => setConstrucciones(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const addToma = (t: Omit<Toma, 'id'>) => setTomas(prev => [...prev, { ...t, id: genId('T') }]);
  const updateToma = (id: string, updates: Partial<Toma>) => setTomas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  const addContrato = (c: Omit<Contrato, 'id'>) => {
    const id = genId('CT');
    setContratos(prev => [...prev, { ...c, id }]);
    if (c.tomaId) updateToma(c.tomaId, { estado: 'Asignada' });
  };
  const updateContrato = (id: string, updates: Partial<Contrato>) => setContratos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const addMedidor = (m: Omit<Medidor, 'id'>) => {
    const id = genId('M');
    setMedidores(prev => [...prev, { ...m, id }]);
    updateContrato(m.contratoId, { estado: 'Activo', medidorId: id });
  };
  const updateMedidor = (id: string, updates: Partial<Medidor>) => setMedidores(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

  const addMedidorBodega = (m: Omit<MedidorBodega, 'id'>) => setMedidoresBodega(prev => [...prev, { ...m, id: genId('MB') }]);
  const updateMedidorBodega = (id: string, updates: Partial<MedidorBodega>) => setMedidoresBodega(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const removeMedidorBodega = (id: string) => setMedidoresBodega(prev => prev.filter(m => m.id !== id));
  const assignMedidorFromBodega = (medidorBodegaId: string, contratoId: string, lecturaInicial: number, zonaId: string) => {
    const mb = medidoresBodega.find(m => m.id === medidorBodegaId);
    if (!mb || mb.estado !== 'Disponible') return;
    addMedidor({ contratoId, serie: mb.serie, estado: 'Activo', cobroDiferido: false, lecturaInicial });
    updateContrato(contratoId, { zonaId });
    removeMedidorBodega(medidorBodegaId);
  };

  const addRuta = (r: Omit<Ruta, 'id'>) => {
    const id = genId('R');
    setRutas(prev => [...prev, { ...r, id }]);
    const zonaId = r.zonaId;
    r.contratoIds.forEach(cid => updateContrato(cid, { rutaId: id, zonaId }));
  };
  const updateRuta = (id: string, updates: Partial<Ruta>) => setRutas(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

  const moveContratoToRuta = (contratoId: string, rutaId: string | null) => {
    const contrato = contratos.find(c => c.id === contratoId);
    if (!contrato) return;
    const prevRutaId = contrato.rutaId;
    if (prevRutaId) {
      const ruta = rutas.find(r => r.id === prevRutaId);
      if (ruta) updateRuta(prevRutaId, { contratoIds: ruta.contratoIds.filter(cid => cid !== contratoId) });
    }
    if (rutaId) {
      const ruta = rutas.find(r => r.id === rutaId);
      if (ruta) {
        updateRuta(rutaId, { contratoIds: [...ruta.contratoIds, contratoId] });
        updateContrato(contratoId, { rutaId, zonaId: ruta.zonaId });
      }
    } else {
      updateContrato(contratoId, { rutaId: undefined, zonaId: undefined });
    }
  };

  const addAdministracion = (a: Omit<Administracion, 'id'>) => setAdministraciones(prev => [...prev, { ...a, id: genId('ADM') }]);
  const updateAdministracion = (id: string, updates: Partial<Administracion>) => setAdministraciones(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const addZona = (z: Omit<Zona, 'id'>) => setZonas(prev => [...prev, { ...z, id: genId('Z') }]);
  const updateZona = (id: string, updates: Partial<Zona>) => setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  const addDistrito = (d: Omit<Distrito, 'id'>) => setDistritos(prev => [...prev, { ...d, id: genId('DIST') }]);
  const updateDistrito = (id: string, updates: Partial<Distrito>) => setDistritos(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

  const addLectura = (l: Omit<Lectura, 'id'>) => setLecturas(prev => [...prev, { ...l, id: genId('L') }]);
  const updateLectura = (id: string, updates: Partial<Lectura>) => setLecturas(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

  const addConsumo = (c: Omit<Consumo, 'id'>) => setConsumos(prev => [...prev, { ...c, id: genId('CO') }]);
  const updateConsumo = (id: string, updates: Partial<Consumo>) => setConsumos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const addPreFactura = (p: Omit<PreFactura, 'id'>) => setPreFacturas(prev => [...prev, { ...p, id: genId('PF') }]);
  const updatePreFactura = (id: string, updates: Partial<PreFactura>) => setPreFacturas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const addTimbrado = (t: Omit<Timbrado, 'id'>) => setTimbrados(prev => [...prev, { ...t, id: genId('TM') }]);
  const updateTimbrado = (id: string, updates: Partial<Timbrado>) => setTimbrados(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  const addRecibo = (r: Omit<Recibo, 'id'>) => setRecibos(prev => [...prev, { ...r, id: genId('RB') }]);
  const updateRecibo = (id: string, updates: Partial<Recibo>) => setRecibos(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

  const addPagoParcialidad = (p: Omit<PagoParcialidad, 'id'>) => setPagosParcialidad(prev => [...prev, { ...p, id: genId('PP') }]);
  const updatePagoParcialidad = (id: string, updates: Partial<PagoParcialidad>) => setPagosParcialidad(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const addPago = (p: Omit<Pago, 'id'>) => setPagos(prev => [...prev, { ...p, id: genId('P'), origen: p.origen ?? 'nativo' }]);
  const addPagoExterno = (p: Omit<PagoExterno, 'id'>) => setPagosExternos(prev => [...prev, { ...p, id: genId('EX') }]);
  const updatePagoExterno = (id: string, updates: Partial<PagoExterno>) => setPagosExternos(prev => prev.map(pe => pe.id === id ? { ...pe, ...updates } : pe));
  const conciliarPagoExterno = (id: string, contratoId: string) => {
    const pe = pagosExternos.find(x => x.id === id);
    if (!pe || pe.estado === 'conciliado') return;
    addPago({ contratoId, monto: pe.monto, fecha: pe.fecha, tipo: pe.tipo, concepto: pe.concepto || `Conciliado ${pe.referencia}`, origen: 'externo' });
    updatePagoExterno(id, { estado: 'conciliado', contratoIdSugerido: contratoId });
  };

  const calcularTarifa = (tipoServicio: string, m3: number) => {
    const tipo = tipoServicio === 'Doméstico' ? 'Doméstico' : tipoServicio === 'Comercial' ? 'Comercial' : 'Industrial';
    const aplicables = tarifas.filter(t => t.tipo === tipo && m3 >= t.rangoMin && m3 <= t.rangoMax);
    const tarifa = aplicables[0] || tarifas[0];
    const subtotal = m3 * tarifa.precioPorM3;
    return { subtotal, cargoFijo: tarifa.cargoFijo, total: subtotal + tarifa.cargoFijo };
  };

  return (
    <DataContext.Provider value={{
      factibilidades, construcciones, tomas, contratos, medidores, rutas, lecturas, consumos, tarifas, descuentos, preFacturas, timbrados, recibos, pagos,
      administraciones, zonas, distritos,
      currentUser, setCurrentUser, allowedZonaIds, mensajeGlobalRecibos, setMensajeGlobalRecibos,
      pagosParcialidad, addPagoParcialidad, updatePagoParcialidad,
      pagosExternos, addPagoExterno, updatePagoExterno, conciliarPagoExterno,
      medidoresBodega, addMedidorBodega, updateMedidorBodega, removeMedidorBodega, assignMedidorFromBodega,
      addFactibilidad, updateFactibilidad, addConstruccion, updateConstruccion, addToma, updateToma,
      addContrato, updateContrato, addMedidor, updateMedidor, addRuta, updateRuta, moveContratoToRuta,
      addLectura, updateLectura, addConsumo, updateConsumo, addPreFactura, updatePreFactura,
      addTimbrado, updateTimbrado, addRecibo, updateRecibo, addPago, calcularTarifa,
      addAdministracion, updateAdministracion, addZona, updateZona, addDistrito, updateDistrito,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
