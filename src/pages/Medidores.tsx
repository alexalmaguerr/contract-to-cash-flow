import { useState } from 'react';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Medidores = () => {
  const { medidores, contratos, addMedidor, updateMedidor } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ contratoId: '', serie: '', cobroDiferido: false, lecturaInicial: 0 });

  const pendientes = contratos.filter(c => c.estado === 'Pendiente de alta');

  const handleCreate = () => {
    addMedidor({ ...form, estado: 'Activo', lecturaInicial: form.lecturaInicial });
    setForm({ contratoId: '', serie: '', cobroDiferido: false, lecturaInicial: 0 });
    setShowCreate(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Medidores</h1>
        <Button onClick={() => setShowCreate(true)} disabled={pendientes.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Asignar medidor
        </Button>
      </div>

      {pendientes.length > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
          ⚠️ Hay <strong>{pendientes.length}</strong> contrato(s) pendientes de activación (requieren medidor).
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Serie</th><th>Contrato</th><th>Estado</th><th>Cobro diferido</th><th>Lectura inicial</th><th>Acciones</th></tr></thead>
          <tbody>
            {medidores.map(m => (
              <tr key={m.id}>
                <td className="font-mono text-xs">{m.id}</td>
                <td>{m.serie}</td>
                <td className="font-mono text-xs">{m.contratoId}</td>
                <td><StatusBadge status={m.estado} /></td>
                <td>{m.cobroDiferido ? 'Sí' : 'No'}</td>
                <td>{m.lecturaInicial}</td>
                <td>
                  {m.estado === 'Activo' && <Button size="sm" variant="outline" onClick={() => updateMedidor(m.id, { estado: 'Inactivo' })}>Desactivar</Button>}
                  {m.estado === 'Inactivo' && <Button size="sm" onClick={() => updateMedidor(m.id, { estado: 'Activo' })}>Activar</Button>}
                </td>
              </tr>
            ))}
            {medidores.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No hay medidores</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Asignar Medidor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={form.contratoId} onValueChange={v => setForm({ ...form, contratoId: v })}>
              <SelectTrigger><SelectValue placeholder="Contrato pendiente" /></SelectTrigger>
              <SelectContent>{pendientes.map(c => <SelectItem key={c.id} value={c.id}>{c.id} - {c.nombre}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Serie del medidor" value={form.serie} onChange={e => setForm({ ...form, serie: e.target.value })} />
            <Input type="number" placeholder="Lectura inicial" value={form.lecturaInicial} onChange={e => setForm({ ...form, lecturaInicial: Number(e.target.value) })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.cobroDiferido} onCheckedChange={v => setForm({ ...form, cobroDiferido: v })} />
              <span className="text-sm">Cobro diferido</span>
            </div>
            <p className="text-xs text-muted-foreground">Al asignar el medidor, el contrato pasará a estado <strong>Activo</strong>.</p>
            <Button onClick={handleCreate} disabled={!form.contratoId || !form.serie} className="w-full">Asignar y activar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medidores;
