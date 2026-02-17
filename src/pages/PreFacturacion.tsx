import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';

const PreFacturacion = () => {
  const { preFacturas, addPreFactura, updatePreFactura, consumos, contratos, calcularTarifa } = useData();

  const consumosConfirmados = consumos.filter(c => c.confirmado && !preFacturas.some(pf => pf.contratoId === c.contratoId && pf.periodo === c.periodo));

  const generarPreFactura = (consumo: typeof consumos[0]) => {
    const contrato = contratos.find(c => c.id === consumo.contratoId);
    if (!contrato) return;
    const { subtotal, cargoFijo, total } = calcularTarifa(contrato.tipoServicio, consumo.m3);
    addPreFactura({
      contratoId: consumo.contratoId,
      periodo: consumo.periodo,
      consumoM3: consumo.m3,
      subtotal,
      descuento: 0,
      total,
      estado: 'Pendiente',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pre-Facturación</h1>
      </div>

      {consumosConfirmados.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">Consumos listos para facturar</h3>
          <div className="flex gap-2 flex-wrap">
            {consumosConfirmados.map(c => (
              <Button key={c.id} variant="outline" size="sm" onClick={() => generarPreFactura(c)}>
                Generar {c.contratoId} / {c.periodo}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Contrato</th><th>Periodo</th><th>m³</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {preFacturas.map(pf => (
              <tr key={pf.id}>
                <td className="font-mono text-xs">{pf.id}</td>
                <td className="font-mono text-xs">{pf.contratoId}</td>
                <td>{pf.periodo}</td>
                <td>{pf.consumoM3}</td>
                <td className="font-semibold">${pf.total.toFixed(2)}</td>
                <td><StatusBadge status={pf.estado} /></td>
                <td>
                  {pf.estado === 'Pendiente' && <Button size="sm" variant="outline" onClick={() => updatePreFactura(pf.id, { estado: 'Validada' })}>Validar</Button>}
                  {pf.estado === 'Validada' && <Button size="sm" onClick={() => updatePreFactura(pf.id, { estado: 'Aceptada' })}>Aceptar</Button>}
                </td>
              </tr>
            ))}
            {preFacturas.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No hay pre-facturas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreFacturacion;
