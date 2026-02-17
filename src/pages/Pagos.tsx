import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Pagos = () => {
  const { pagos, addPago, contratos, recibos } = useData();
  const [form, setForm] = useState({ contratoId: '', monto: '', tipo: '' as any, concepto: '' });

  const activos = contratos.filter(c => c.estado === 'Activo');

  const handlePago = () => {
    addPago({
      contratoId: form.contratoId,
      monto: Number(form.monto),
      fecha: new Date().toISOString().split('T')[0],
      tipo: form.tipo,
      concepto: form.concepto,
    });
    setForm({ contratoId: '', monto: '', tipo: '', concepto: '' });
  };

  // Calculate adeudos per contrato
  const adeudos = activos.map(c => {
    const recibosContrato = recibos.filter(r => r.contratoId === c.id);
    const pagosContrato = pagos.filter(p => p.contratoId === c.id);
    const totalRecibos = recibosContrato.reduce((s, r) => s + r.saldoVigente + r.saldoVencido, 0);
    const totalPagos = pagosContrato.reduce((s, p) => s + p.monto, 0);
    return { contrato: c, saldo: totalRecibos - totalPagos };
  }).filter(a => a.saldo > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pagos y Adeudos</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="widget-card">
          <h3 className="section-title">Registrar pago</h3>
          <div className="space-y-3">
            <Select value={form.contratoId} onValueChange={v => setForm({ ...form, contratoId: v })}>
              <SelectTrigger><SelectValue placeholder="Contrato" /></SelectTrigger>
              <SelectContent>{activos.map(c => <SelectItem key={c.id} value={c.id}>{c.id} - {c.nombre}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Monto" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} />
            <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue placeholder="Tipo de pago" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Concepto" value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} />
            <Button onClick={handlePago} disabled={!form.contratoId || !form.monto || !form.tipo} className="w-full">Registrar pago</Button>
          </div>
        </div>

        <div>
          <h3 className="section-title">Adeudos</h3>
          {adeudos.length > 0 ? (
            <div className="space-y-2">
              {adeudos.map(a => (
                <div key={a.contrato.id} className="widget-card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.contrato.nombre}</p>
                    <p className="text-xs text-muted-foreground">{a.contrato.id}</p>
                  </div>
                  <span className="text-lg font-bold text-destructive">${a.saldo.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Sin adeudos pendientes</p>
          )}

          <h3 className="section-title mt-6">Historial de pagos</h3>
          <div className="rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Contrato</th><th>Monto</th><th>Tipo</th><th>Fecha</th></tr></thead>
              <tbody>
                {pagos.slice().reverse().map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.contratoId}</td>
                    <td className="font-semibold text-success">${p.monto.toFixed(2)}</td>
                    <td>{p.tipo}</td>
                    <td className="text-muted-foreground">{p.fecha}</td>
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

export default Pagos;
