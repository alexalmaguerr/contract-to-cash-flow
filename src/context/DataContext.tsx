import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type FactibilidadEstado = 'Pre-factibilidad' | 'En comité' | 'Aprobada' | 'Rechazada';
export type ConstruccionEstado = 'Planeación' | 'En proceso' | 'Finalizada';
export type TomaEstado = 'Disponible' | 'Asignada';
export type ContratoEstado = 'Pendiente de alta' | 'Activo' | 'Suspendido' | 'Cancelado';
export type MedidorEstado = 'Activo' | 'Inactivo';
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
  zona: string;
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

export interface Recibo {
  id: string;
  timbradoId: string;
  contratoId: string;
  saldoVigente: number;
  saldoVencido: number;
  parcialidades: number;
  fechaVencimiento: string;
  impreso: boolean;
}

export interface Pago {
  id: string;
  contratoId: string;
  monto: number;
  fecha: string;
  tipo: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  concepto: string;
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

const initialContratos: Contrato[] = [
  { id: 'CT001', tomaId: 'T001', tipoContrato: 'Agua', tipoServicio: 'Doméstico', nombre: 'Juan Pérez García', rfc: 'PEGJ800101XXX', direccion: 'Juriquilla Lote 23-A #1', contacto: '442-111-2233', estado: 'Activo', fecha: '2025-01-25', medidorId: 'M001', rutaId: 'R001' },
];

const initialMedidores: Medidor[] = [
  { id: 'M001', contratoId: 'CT001', serie: 'MED-2025-00001', estado: 'Activo', cobroDiferido: false, lecturaInicial: 0 },
];

const initialRutas: Ruta[] = [
  { id: 'R001', zona: 'Norte', sector: 'Juriquilla', libreta: 'LIB-001', lecturista: 'Pedro Ramírez', contratoIds: ['CT001'] },
];

const initialLecturas: Lectura[] = [
  { id: 'L001', contratoId: 'CT001', rutaId: 'R001', lecturaAnterior: 0, lecturaActual: 15, consumo: 15, estado: 'Válida', incidencia: '', fecha: '2025-02-15', periodo: '2025-02' },
];

const initialConsumos: Consumo[] = [
  { id: 'CO001', contratoId: 'CT001', lecturaId: 'L001', tipo: 'Real', m3: 15, periodo: '2025-02', confirmado: true },
];

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

const initialPreFacturas: PreFactura[] = [];
const initialTimbrados: Timbrado[] = [];
const initialRecibos: Recibo[] = [];
const initialPagos: Pago[] = [
  { id: 'P001', contratoId: 'CT001', monto: 172.00, fecha: '2025-01-30', tipo: 'Efectivo', concepto: 'Pago servicio enero 2025' },
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
  addRuta: (r: Omit<Ruta, 'id'>) => void;
  updateRuta: (id: string, updates: Partial<Ruta>) => void;
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
  const [rutas, setRutas] = useState(initialRutas);
  const [lecturas, setLecturas] = useState(initialLecturas);
  const [consumos, setConsumos] = useState(initialConsumos);
  const [tarifas] = useState(initialTarifas);
  const [descuentos] = useState(initialDescuentos);
  const [preFacturas, setPreFacturas] = useState(initialPreFacturas);
  const [timbrados, setTimbrados] = useState(initialTimbrados);
  const [recibos, setRecibos] = useState(initialRecibos);
  const [pagos, setPagos] = useState(initialPagos);

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

  const addRuta = (r: Omit<Ruta, 'id'>) => {
    const id = genId('R');
    setRutas(prev => [...prev, { ...r, id }]);
    r.contratoIds.forEach(cid => updateContrato(cid, { rutaId: id }));
  };
  const updateRuta = (id: string, updates: Partial<Ruta>) => setRutas(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

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

  const addPago = (p: Omit<Pago, 'id'>) => setPagos(prev => [...prev, { ...p, id: genId('P') }]);

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
      addFactibilidad, updateFactibilidad, addConstruccion, updateConstruccion, addToma, updateToma,
      addContrato, updateContrato, addMedidor, updateMedidor, addRuta, updateRuta,
      addLectura, updateLectura, addConsumo, updateConsumo, addPreFactura, updatePreFactura,
      addTimbrado, updateTimbrado, addRecibo, updateRecibo, addPago, calcularTarifa,
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
