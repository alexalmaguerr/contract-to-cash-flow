import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';

const TimbradoPage = () => {
  const { timbrados, addTimbrado, updateTimbrado, preFacturas } = useData();

  const aceptadas = preFacturas.filter(pf => pf.estado === 'Aceptada' && !timbrados.some(t => t.preFacturaId === pf.id));

  const timbrar = (pf: typeof preFacturas[0]) => {
    const exito = Math.random() > 0.3;
    addTimbrado({
      preFacturaId: pf.id,
      contratoId: pf.contratoId,
      uuid: exito ? `UUID-${Date.now().toString(36).toUpperCase()}` : '',
      estado: exito ? 'Timbrada OK' : 'Error PAC',
      error: exito ? undefined : 'Error de conexión con PAC: timeout',
      fecha: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monitor de Timbrado</h1>
      </div>

      {aceptadas.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">Pre-facturas listas para timbrar</h3>
          <div className="flex gap-2 flex-wrap">
            {aceptadas.map(pf => (
              <Button key={pf.id} size="sm" onClick={() => timbrar(pf)}>
                Timbrar {pf.id} (${pf.total.toFixed(2)})
              </Button>
            ))}
            <Button variant="outline" onClick={() => aceptadas.forEach(timbrar)}>Timbrar todas</Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Pre-factura</th><th>Contrato</th><th>UUID</th><th>Estado</th><th>Error</th><th></th></tr></thead>
          <tbody>
            {timbrados.map(t => (
              <tr key={t.id}>
                <td className="font-mono text-xs">{t.id}</td>
                <td className="font-mono text-xs">{t.preFacturaId}</td>
                <td className="font-mono text-xs">{t.contratoId}</td>
                <td className="font-mono text-xs">{t.uuid || '—'}</td>
                <td><StatusBadge status={t.estado} /></td>
                <td className="text-xs text-destructive">{t.error || '—'}</td>
                <td>
                  {t.estado === 'Error PAC' && (
                    <Button size="sm" variant="outline" onClick={() => {
                      const exito = Math.random() > 0.3;
                      updateTimbrado(t.id, {
                        estado: exito ? 'Timbrada OK' : 'Error PAC',
                        uuid: exito ? `UUID-${Date.now().toString(36).toUpperCase()}` : '',
                        error: exito ? undefined : 'Reintento fallido',
                      });
                    }}>Reintentar</Button>
                  )}
                </td>
              </tr>
            ))}
            {timbrados.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No hay timbrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimbradoPage;
