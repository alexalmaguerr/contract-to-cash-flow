import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const Recibos = () => {
  const {
    recibos,
    addRecibo,
    updateRecibo,
    timbrados,
    contratos,
    allowedZonaIds,
    mensajeGlobalRecibos,
    setMensajeGlobalRecibos,
    pagosParcialidad,
  } = useData();
  const [showMensajeIndividual, setShowMensajeIndividual] = useState(false);
  const [selectedReciboIds, setSelectedReciboIds] = useState<Set<string>>(new Set());
  const [mensajeIndividualTexto, setMensajeIndividualTexto] = useState('');
  const [filtroContrato, setFiltroContrato] = useState('');
  const [previewReciboId, setPreviewReciboId] = useState<string | null>(null);

  const contratoIdsVisibles = useMemo(() => {
    if (!allowedZonaIds) return new Set(contratos.map(c => c.id));
    return new Set(contratos.filter(c => c.zonaId && allowedZonaIds.includes(c.zonaId)).map(c => c.id));
  }, [contratos, allowedZonaIds]);
  const recibosVisibles = useMemo(() => recibos.filter(r => contratoIdsVisibles.has(r.contratoId)), [recibos, contratoIdsVisibles]);
  const recibosParaSeleccion = useMemo(() => {
    if (!filtroContrato) return recibosVisibles;
    return recibosVisibles.filter(r => r.contratoId === filtroContrato);
  }, [recibosVisibles, filtroContrato]);
  const timbradosOK = useMemo(() =>
    timbrados.filter(t => t.estado === 'Timbrada OK' && contratoIdsVisibles.has(t.contratoId) && !recibos.some(r => r.timbradoId === t.id)),
    [timbrados, recibos, contratoIdsVisibles]
  );

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

  const mensajeEfectivo = (r: typeof recibos[0]) => (r.mensajeIndividual ?? mensajeGlobalRecibos) || '—';

  const parcialidadesByContrato = useMemo(() => {
    const map: Record<string, typeof pagosParcialidad> = {};
    pagosParcialidad.forEach(pp => {
      if (!map[pp.contratoId]) map[pp.contratoId] = [];
      map[pp.contratoId].push(pp);
    });
    return map;
  }, [pagosParcialidad]);

  const previewRecibo = previewReciboId ? recibos.find(r => r.id === previewReciboId) : null;
  const previewContrato = previewRecibo ? contratos.find(c => c.id === previewRecibo.contratoId) : null;
  const previewTimbrado = previewRecibo ? timbrados.find(t => t.id === previewRecibo.timbradoId) : null;
  const previewParcialidades = previewRecibo ? (parcialidadesByContrato[previewRecibo.contratoId] ?? []) : [];

  const toggleSelectRecibo = (id: string) => {
    setSelectedReciboIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const aplicarMensajeIndividual = () => {
    selectedReciboIds.forEach(id => updateRecibo(id, { mensajeIndividual: mensajeIndividualTexto }));
    setSelectedReciboIds(new Set());
    setMensajeIndividualTexto('');
    setShowMensajeIndividual(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Recibos e Impresión</h1>
      </div>

      <div className="mb-6 rounded-lg border p-4 space-y-3">
        <h3 className="section-title">Mensajes antes de enviar a timbrar</h3>
        <div>
          <label className="text-sm font-medium">Mensaje global</label>
          <Textarea
            placeholder="Mensaje que se mostrará en todos los recibos (salvo los que tengan mensaje individual)"
            value={mensajeGlobalRecibos}
            onChange={e => setMensajeGlobalRecibos(e.target.value)}
            className="mt-1 min-h-[80px]"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowMensajeIndividual(true)}>
          Mensaje individual (seleccionar facturas/recibos)
        </Button>
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
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Saldo vigente</th>
              <th>Saldo vencido</th>
              <th>Vencimiento</th>
              <th>Parcialidades</th>
              <th>Mensaje</th>
              <th>Impreso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recibosVisibles.map(r => {
              const contrato = contratos.find(c => c.id === r.contratoId);
              const parcialidades = parcialidadesByContrato[r.contratoId] ?? [];
              return (
                <tr key={r.id}>
                  <td><span className="font-mono text-xs">{r.contratoId}</span> <span className="text-muted-foreground text-xs">- {contrato?.nombre}</span></td>
                  <td className="font-semibold">${r.saldoVigente.toFixed(2)}</td>
                  <td className={r.saldoVencido > 0 ? 'text-destructive font-semibold' : ''}>${r.saldoVencido.toFixed(2)}</td>
                  <td>{r.fechaVencimiento}</td>
                  <td>{parcialidades.length > 0 ? `${parcialidades.filter(p => p.estado === 'Pendiente').length} pendiente(s)` : r.parcialidades}</td>
                  <td className="text-xs max-w-[200px] truncate" title={mensajeEfectivo(r)}>{mensajeEfectivo(r)}</td>
                  <td>{r.impreso ? <span className="status-badge status-success">Sí</span> : <span className="status-badge status-warning">No</span>}</td>
                  <td className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setPreviewReciboId(r.id)}>Vista previa</Button>
                    {!r.impreso && <Button size="sm" onClick={() => updateRecibo(r.id, { impreso: true })}>Imprimir</Button>}
                  </td>
                </tr>
              );
            })}
            {recibosVisibles.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No hay recibos</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!previewReciboId} onOpenChange={() => setPreviewReciboId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Vista previa del recibo</DialogTitle></DialogHeader>
          {previewRecibo && previewContrato && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Contrato:</span> {previewRecibo.contratoId} – {previewContrato.nombre}</div>
              <div><span className="text-muted-foreground">Dirección:</span> {previewContrato.direccion}</div>
              {previewTimbrado && <div><span className="text-muted-foreground">UUID:</span> {previewTimbrado.uuid}</div>}
              <div><span className="text-muted-foreground">Fecha vencimiento:</span> {previewRecibo.fechaVencimiento}</div>
              <div><span className="text-muted-foreground">Saldo vigente:</span> ${previewRecibo.saldoVigente.toFixed(2)}</div>
              <div><span className="text-muted-foreground">Saldo vencido:</span> ${previewRecibo.saldoVencido.toFixed(2)}</div>
              {previewParcialidades.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Pagos en parcialidades:</span>
                  <ul className="list-disc pl-4 mt-1">
                    {previewParcialidades.map(pp => (
                      <li key={pp.id}>Cuota {pp.numero}: ${pp.monto.toFixed(2)} – {pp.fechaVencimiento} ({pp.estado})</li>
                    ))}
                  </ul>
                </div>
              )}
              <div><span className="text-muted-foreground">Mensaje:</span> {mensajeEfectivo(previewRecibo)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showMensajeIndividual} onOpenChange={setShowMensajeIndividual}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Mensaje individual</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Selecciona los recibos y asigna un mensaje. Este mensaje tiene prioridad sobre el mensaje global.</p>
          <Input
            placeholder="Filtrar por contrato"
            value={filtroContrato}
            onChange={e => setFiltroContrato(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2">
            {recibosParaSeleccion.map(r => {
              const c = contratos.find(x => x.id === r.contratoId);
              return (
                <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedReciboIds.has(r.id)} onCheckedChange={() => toggleSelectRecibo(r.id)} />
                  <span className="font-mono text-xs">{r.id}</span>
                  <span>{r.contratoId}</span>
                  <span className="text-muted-foreground text-xs">{c?.nombre}</span>
                </label>
              );
            })}
          </div>
          <Textarea
            placeholder="Mensaje para los recibos seleccionados"
            value={mensajeIndividualTexto}
            onChange={e => setMensajeIndividualTexto(e.target.value)}
            className="min-h-[60px]"
          />
          <Button onClick={aplicarMensajeIndividual} disabled={selectedReciboIds.size === 0 || !mensajeIndividualTexto.trim()}>
            Aplicar a {selectedReciboIds.size} recibo(s)
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recibos;
