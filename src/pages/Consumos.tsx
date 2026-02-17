import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const Consumos = () => {
  const { consumos, addConsumo, updateConsumo, lecturas, contratos } = useData();
  const [contratoId, setContratoId] = useState('');
  const [tipo, setTipo] = useState<any>('Promedio histórico');
  const [m3, setM3] = useState('');

  const lecturasValidas = lecturas.filter(l => l.estado === 'Válida');
  const activos = contratos.filter(c => c.estado === 'Activo');

  const handleEstimado = () => {
    addConsumo({
      contratoId,
      lecturaId: '',
      tipo,
      m3: Number(m3),
      periodo: new Date().toISOString().slice(0, 7),
      confirmado: false,
    });
    setContratoId('');
    setM3('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Consumos</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="section-title">Consumos confirmados</h3>
          <div className="rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Contrato</th><th>Tipo</th><th>m³</th><th>Periodo</th><th>Confirmado</th><th></th></tr></thead>
              <tbody>
                {consumos.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.contratoId}</td>
                    <td>{c.tipo}</td>
                    <td className="font-semibold">{c.m3}</td>
                    <td>{c.periodo}</td>
                    <td>{c.confirmado ? <span className="status-badge status-success">Sí</span> : <span className="status-badge status-warning">No</span>}</td>
                    <td>{!c.confirmado && <Button size="sm" onClick={() => updateConsumo(c.id, { confirmado: true })}>Confirmar</Button>}</td>
                  </tr>
                ))}
                {consumos.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No hay consumos</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="widget-card">
          <h3 className="section-title">Asignar consumo estimado</h3>
          <div className="space-y-3">
            <Select value={contratoId} onValueChange={setContratoId}>
              <SelectTrigger><SelectValue placeholder="Contrato activo" /></SelectTrigger>
              <SelectContent>{activos.map(c => <SelectItem key={c.id} value={c.id}>{c.id} - {c.nombre}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo de consumo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Promedio histórico">Promedio histórico</SelectItem>
                <SelectItem value="Mixto">Mixto</SelectItem>
                <SelectItem value="Consumo fijo">Consumo fijo</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="m³ estimados" value={m3} onChange={e => setM3(e.target.value)} />
            <Button onClick={handleEstimado} disabled={!contratoId || !m3} className="w-full">Asignar estimado</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consumos;
