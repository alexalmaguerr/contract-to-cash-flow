import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Package, Gauge } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Medidores = () => {
  const {
    medidores,
    medidoresBodega,
    contratos,
    zonas,
    addMedidor,
    updateMedidor,
    addMedidorBodega,
    updateMedidorBodega,
    assignMedidorFromBodega,
    allowedZonaIds,
  } = useData();
  const contratosVisibles = useMemo(() =>
    !allowedZonaIds ? contratos : contratos.filter(c => c.zonaId && allowedZonaIds.includes(c.zonaId)),
    [contratos, allowedZonaIds]
  );
  const [showAddBodega, setShowAddBodega] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [bodegaForm, setBodegaForm] = useState({ serie: '', zonaId: '', estado: 'Disponible' as 'Disponible' | 'En reparación' });
  const [assignForm, setAssignForm] = useState({ medidorBodegaId: '', contratoId: '', lecturaInicial: 0 });

  // Filtros asignados
  const [filtroZona, setFiltroZona] = useState<string>('all');
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [filtroSerie, setFiltroSerie] = useState('');

  // Filtros bodega
  const [filtroBodegaEstado, setFiltroBodegaEstado] = useState<string>('all');
  const [filtroBodegaSerie, setFiltroBodegaSerie] = useState('');

  const pendientes = contratosVisibles.filter(c => c.estado === 'Pendiente de alta');
  const disponiblesBodega = medidoresBodega.filter(m => m.estado === 'Disponible');

  const medidoresFiltrados = useMemo(() => {
    return medidores.filter(m => {
      const contrato = contratosVisibles.find(c => c.id === m.contratoId);
      if (!contrato) return false;
      if (filtroZona !== 'all' && contrato.zonaId !== filtroZona) return false;
      if (filtroEstado !== 'all' && m.estado !== filtroEstado) return false;
      if (filtroSerie && !m.serie.toLowerCase().includes(filtroSerie.toLowerCase())) return false;
      return true;
    });
  }, [medidores, contratosVisibles, filtroZona, filtroEstado, filtroSerie]);

  const bodegaFiltrados = useMemo(() => {
    return medidoresBodega.filter(m => {
      if (filtroBodegaEstado !== 'all' && m.estado !== filtroBodegaEstado) return false;
      if (filtroBodegaSerie && !m.serie.toLowerCase().includes(filtroBodegaSerie.toLowerCase())) return false;
      return true;
    });
  }, [medidoresBodega, filtroBodegaEstado, filtroBodegaSerie]);

  const handleAddBodega = () => {
    addMedidorBodega({ serie: bodegaForm.serie, zonaId: bodegaForm.zonaId, estado: bodegaForm.estado });
    setBodegaForm({ serie: '', zonaId: '', estado: 'Disponible' });
    setShowAddBodega(false);
  };

  const handleAssign = () => {
    assignMedidorFromBodega(assignForm.medidorBodegaId, assignForm.contratoId, assignForm.lecturaInicial);
    setAssignForm({ medidorBodegaId: '', contratoId: '', lecturaInicial: 0 });
    setShowAssign(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventario de Medidores</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddBodega(true)}>
            <Plus className="h-4 w-4 mr-1" /> Alta en bodega
          </Button>
          <Button onClick={() => setShowAssign(true)} disabled={disponiblesBodega.length === 0 || pendientes.length === 0}>
            <Gauge className="h-4 w-4 mr-1" /> Asignar a contrato
          </Button>
        </div>
      </div>

      {pendientes.length > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
          Hay <strong>{pendientes.length}</strong> contrato(s) pendientes de activación (requieren medidor).
        </div>
      )}

      <Tabs defaultValue="asignados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="asignados">
            <Gauge className="h-4 w-4 mr-1" /> Asignados ({medidores.length})
          </TabsTrigger>
          <TabsTrigger value="bodega">
            <Package className="h-4 w-4 mr-1" /> En bodega ({medidoresBodega.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="asignados" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={filtroZona} onValueChange={setFiltroZona}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Zona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las zonas</SelectItem>
                {zonas.map(z => <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Filtrar por serie" className="w-48" value={filtroSerie} onChange={e => setFiltroSerie(e.target.value)} />
          </div>
          <div className="rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Serie</th><th>Contrato</th><th>Zona</th><th>Estado</th><th>Cobro diferido</th><th>Lectura inicial</th><th>Acciones</th></tr></thead>
              <tbody>
                {medidoresFiltrados.map(m => {
                  const contrato = contratosVisibles.find(c => c.id === m.contratoId);
                  const zona = contrato?.zonaId ? zonas.find(z => z.id === contrato.zonaId) : null;
                  return (
                    <tr key={m.id}>
                      <td className="font-mono text-xs">{m.id}</td>
                      <td>{m.serie}</td>
                      <td className="font-mono text-xs">{m.contratoId}</td>
                      <td className="text-sm">{zona?.nombre ?? '—'}</td>
                      <td><StatusBadge status={m.estado} /></td>
                      <td>{m.cobroDiferido ? 'Sí' : 'No'}</td>
                      <td>{m.lecturaInicial}</td>
                      <td>
                        {m.estado === 'Activo' && <Button size="sm" variant="outline" onClick={() => updateMedidor(m.id, { estado: 'Inactivo' })}>Desactivar</Button>}
                        {m.estado === 'Inactivo' && <Button size="sm" onClick={() => updateMedidor(m.id, { estado: 'Activo' })}>Activar</Button>}
                      </td>
                    </tr>
                  );
                })}
                {medidoresFiltrados.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No hay medidores asignados</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bodega" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={filtroBodegaEstado} onValueChange={setFiltroBodegaEstado}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="En reparación">En reparación</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Filtrar por serie" className="w-48" value={filtroBodegaSerie} onChange={e => setFiltroBodegaSerie(e.target.value)} />
          </div>
          <div className="rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Serie</th><th>Zona</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {bodegaFiltrados.map(m => {
                  const zona = m.zonaId ? zonas.find(z => z.id === m.zonaId) : null;
                  return (
                  <tr key={m.id}>
                    <td className="font-mono text-xs">{m.id}</td>
                    <td>{m.serie}</td>
                    <td className="text-sm">{zona?.nombre ?? '—'}</td>
                    <td><StatusBadge status={m.estado} /></td>
                    <td>
                      <Select value={m.estado} onValueChange={(v: 'Disponible' | 'En reparación') => updateMedidorBodega(m.id, { estado: v })}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Disponible">Disponible</SelectItem>
                          <SelectItem value="En reparación">En reparación</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                  );
                })}
                {bodegaFiltrados.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No hay medidores en bodega</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddBodega} onOpenChange={setShowAddBodega}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alta de medidor en bodega</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bodega-serie">Serie del medidor</Label>
              <Input id="bodega-serie" placeholder="Ej. MED-2025-00001" value={bodegaForm.serie} onChange={e => setBodegaForm({ ...bodegaForm, serie: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Zona</Label>
              <Select value={bodegaForm.zonaId || undefined} onValueChange={v => setBodegaForm({ ...bodegaForm, zonaId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione una zona" /></SelectTrigger>
                <SelectContent>
                  {(allowedZonaIds ? zonas.filter(z => allowedZonaIds.includes(z.id)) : zonas).map(z => (
                    <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={bodegaForm.estado} onValueChange={(v: 'Disponible' | 'En reparación') => setBodegaForm({ ...bodegaForm, estado: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="En reparación">En reparación</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddBodega} disabled={!bodegaForm.serie.trim() || !bodegaForm.zonaId} className="w-full">Agregar a bodega</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader><DialogTitle>Asignar medidor a contrato</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Medidor disponible en bodega</Label>
              <Select value={assignForm.medidorBodegaId || undefined} onValueChange={v => setAssignForm({ ...assignForm, medidorBodegaId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione un medidor" /></SelectTrigger>
                <SelectContent>
                  {disponiblesBodega.map(m => {
                    const zonaNombre = m.zonaId ? zonas.find(z => z.id === m.zonaId)?.nombre : null;
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {m.serie} {zonaNombre ? `(${zonaNombre})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {assignForm.medidorBodegaId && (() => {
                const mb = disponiblesBodega.find(m => m.id === assignForm.medidorBodegaId);
                const zona = mb?.zonaId ? zonas.find(z => z.id === mb.zonaId) : null;
                return zona ? <p className="text-xs text-muted-foreground">Zona del medidor: <strong>{zona.nombre}</strong></p> : null;
              })()}
            </div>
            <div className="space-y-1.5">
              <Label>Contrato pendiente</Label>
              <Select value={assignForm.contratoId || undefined} onValueChange={v => setAssignForm({ ...assignForm, contratoId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione un contrato" /></SelectTrigger>
                <SelectContent>
                  {pendientes.map(c => {
                    const zonaNombre = c.zonaId ? zonas.find(z => z.id === c.zonaId)?.nombre : null;
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {c.id} – {c.nombre} {zonaNombre ? `(${zonaNombre})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {assignForm.contratoId && (() => {
                const c = pendientes.find(p => p.id === assignForm.contratoId);
                const zona = c?.zonaId ? zonas.find(z => z.id === c.zonaId) : null;
                return zona ? <p className="text-xs text-muted-foreground">Zona del contrato: <strong>{zona.nombre}</strong></p> : null;
              })()}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assign-lectura">Lectura inicial</Label>
              <Input id="assign-lectura" type="number" placeholder="0" value={assignForm.lecturaInicial || ''} onChange={e => setAssignForm({ ...assignForm, lecturaInicial: Number(e.target.value) || 0 })} />
            </div>
            <p className="text-xs text-muted-foreground">El contrato pasará a estado <strong>Activo</strong>. Si el contrato no tenía zona, se asignará la zona del medidor.</p>
            <Button onClick={handleAssign} disabled={!assignForm.medidorBodegaId || !assignForm.contratoId} className="w-full">Asignar y activar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medidores;
