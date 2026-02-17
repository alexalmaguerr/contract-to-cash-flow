import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Rutas = () => {
  const { rutas, addRuta, contratos } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ zona: '', sector: '', libreta: '', lecturista: '', contratoIds: [] as string[] });

  const activos = contratos.filter(c => c.estado === 'Activo' && !c.rutaId);

  const handleCreate = () => {
    addRuta(form);
    setForm({ zona: '', sector: '', libreta: '', lecturista: '', contratoIds: [] });
    setShowCreate(false);
  };

  const toggleContrato = (id: string) => {
    setForm(prev => ({
      ...prev,
      contratoIds: prev.contratoIds.includes(id)
        ? prev.contratoIds.filter(c => c !== id)
        : [...prev.contratoIds, id]
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rutas y Lecturistas</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Nueva ruta</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rutas.map(r => (
          <div key={r.id} className="widget-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{r.zona} - {r.sector}</h3>
                <p className="text-xs text-muted-foreground">Libreta: {r.libreta}</p>
              </div>
              <span className="status-badge status-info">{r.contratoIds.length} contratos</span>
            </div>
            <p className="text-sm"><span className="text-muted-foreground">Lecturista:</span> {r.lecturista}</p>
          </div>
        ))}
        {rutas.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No hay rutas creadas</p>}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Ruta</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Zona" value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })} />
            <Input placeholder="Sector" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
            <Input placeholder="Libreta" value={form.libreta} onChange={e => setForm({ ...form, libreta: e.target.value })} />
            <Input placeholder="Lecturista" value={form.lecturista} onChange={e => setForm({ ...form, lecturista: e.target.value })} />
            {activos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Contratos sin ruta:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {activos.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.contratoIds.includes(c.id)} onChange={() => toggleContrato(c.id)} />
                      {c.id} - {c.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={handleCreate} disabled={!form.zona || !form.lecturista} className="w-full">Crear ruta</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rutas;
