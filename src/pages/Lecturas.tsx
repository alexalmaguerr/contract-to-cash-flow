import { useState } from 'react';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Lecturas = () => {
  const { lecturas, addLectura, rutas, contratos, medidores } = useData();
  const [selectedRuta, setSelectedRuta] = useState('');
  const [captureContratoId, setCaptureContratoId] = useState('');
  const [lecturaActual, setLecturaActual] = useState('');
  const [incidencia, setIncidencia] = useState('');

  const ruta = rutas.find(r => r.id === selectedRuta);
  const rutaContratos = ruta ? contratos.filter(c => ruta.contratoIds.includes(c.id)) : [];

  const handleCapture = () => {
    const contrato = contratos.find(c => c.id === captureContratoId);
    const medidor = medidores.find(m => m.contratoId === captureContratoId);
    const lastLectura = lecturas.filter(l => l.contratoId === captureContratoId).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    const anterior = lastLectura ? lastLectura.lecturaActual : (medidor?.lecturaInicial || 0);
    const actual = Number(lecturaActual);
    const consumo = actual - anterior;

    const rangoMin = 0;
    const rangoMax = 200;
    const esValida = consumo >= rangoMin && consumo <= rangoMax && actual >= anterior;

    addLectura({
      contratoId: captureContratoId,
      rutaId: selectedRuta,
      lecturaAnterior: anterior,
      lecturaActual: actual,
      consumo,
      estado: esValida ? 'Válida' : 'No válida',
      incidencia: incidencia || (esValida ? '' : 'Fuera de rango'),
      fecha: new Date().toISOString().split('T')[0],
      periodo: new Date().toISOString().slice(0, 7),
    });

    setLecturaActual('');
    setIncidencia('');
    setCaptureContratoId('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">App de Lecturas (Simulada)</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Capture panel */}
        <div className="widget-card">
          <h3 className="section-title">Captura de lectura</h3>
          <div className="space-y-3">
            <Select value={selectedRuta} onValueChange={setSelectedRuta}>
              <SelectTrigger><SelectValue placeholder="Seleccionar ruta" /></SelectTrigger>
              <SelectContent>{rutas.map(r => <SelectItem key={r.id} value={r.id}>{r.zona} - {r.sector} ({r.lecturista})</SelectItem>)}</SelectContent>
            </Select>

            {ruta && (
              <>
                <Select value={captureContratoId} onValueChange={setCaptureContratoId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar contrato" /></SelectTrigger>
                  <SelectContent>{rutaContratos.map(c => <SelectItem key={c.id} value={c.id}>{c.id} - {c.nombre}</SelectItem>)}</SelectContent>
                </Select>

                <Input type="number" placeholder="Lectura actual" value={lecturaActual} onChange={e => setLecturaActual(e.target.value)} />
                <Input placeholder="Incidencia (opcional)" value={incidencia} onChange={e => setIncidencia(e.target.value)} />

                <p className="text-xs text-muted-foreground">Rango válido: 0 - 200 m³. Se valida automáticamente.</p>

                <Button onClick={handleCapture} disabled={!captureContratoId || !lecturaActual} className="w-full">Registrar lectura</Button>
              </>
            )}
          </div>
        </div>

        {/* History */}
        <div>
          <h3 className="section-title">Lecturas registradas</h3>
          <div className="rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Contrato</th><th>Anterior</th><th>Actual</th><th>Consumo</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {lecturas.slice().reverse().map(l => (
                  <tr key={l.id}>
                    <td className="font-mono text-xs">{l.contratoId}</td>
                    <td>{l.lecturaAnterior}</td>
                    <td>{l.lecturaActual}</td>
                    <td className="font-semibold">{l.consumo} m³</td>
                    <td><StatusBadge status={l.estado} /></td>
                    <td className="text-muted-foreground">{l.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lecturas;
