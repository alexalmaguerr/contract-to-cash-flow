import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';

const Recibos = () => {
  const { recibos, addRecibo, updateRecibo, timbrados, contratos } = useData();

  const timbradosOK = timbrados.filter(t => t.estado === 'Timbrada OK' && !recibos.some(r => r.timbradoId === t.id));

  const generarRecibo = (t: typeof timbrados[0]) => {
    addRecibo({
      timbradoId: t.id,
      contratoId: t.contratoId,
      saldoVigente: Math.round(Math.random() * 500 + 100),
      saldoVencido: Math.round(Math.random() * 200),
      parcialidades: 0,
      fechaVencimiento: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      impreso: false,
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Recibos e Impresión</h1>
      </div>

      {timbradosOK.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">Generar recibos</h3>
          <div className="flex gap-2 flex-wrap">
            {timbradosOK.map(t => (
              <Button key={t.id} variant="outline" size="sm" onClick={() => generarRecibo(t)}>
                Recibo {t.contratoId}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Contrato</th><th>Saldo vigente</th><th>Saldo vencido</th><th>Vencimiento</th><th>Impreso</th><th></th></tr></thead>
          <tbody>
            {recibos.map(r => {
              const contrato = contratos.find(c => c.id === r.contratoId);
              return (
                <tr key={r.id}>
                  <td><span className="font-mono text-xs">{r.contratoId}</span> <span className="text-muted-foreground text-xs">- {contrato?.nombre}</span></td>
                  <td className="font-semibold">${r.saldoVigente.toFixed(2)}</td>
                  <td className={r.saldoVencido > 0 ? 'text-destructive font-semibold' : ''}>${r.saldoVencido.toFixed(2)}</td>
                  <td>{r.fechaVencimiento}</td>
                  <td>{r.impreso ? <span className="status-badge status-success">Sí</span> : <span className="status-badge status-warning">No</span>}</td>
                  <td>{!r.impreso && <Button size="sm" onClick={() => updateRecibo(r.id, { impreso: true })}>Imprimir</Button>}</td>
                </tr>
              );
            })}
            {recibos.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No hay recibos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recibos;
