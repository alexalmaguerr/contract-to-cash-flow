import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Eye, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';

const Contratos = () => {
  const { contratos, tomas, addContrato } = useData();
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [detail, setDetail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    tomaId: '', tipoContrato: '' as any, tipoServicio: '' as any,
    nombre: '', rfc: '', direccion: '', contacto: ''
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowWizard(true);
  }, [searchParams]);

  const disponibles = tomas.filter(t => t.estado === 'Disponible');

  const handleCreate = () => {
    addContrato({ ...form, estado: 'Pendiente de alta', fecha: new Date().toISOString().split('T')[0] });
    setForm({ tomaId: '', tipoContrato: '', tipoServicio: '', nombre: '', rfc: '', direccion: '', contacto: '' });
    setStep(1);
    setShowWizard(false);
  };

  const selected = contratos.find(c => c.id === detail);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contratos</h1>
        <Button onClick={() => { setStep(1); setShowWizard(true); }} disabled={disponibles.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Alto de contrato
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['Todos', 'Pendiente de alta', 'Activo', 'Suspendido', 'Cancelado'].map(f => (
          <span key={f} className="status-badge status-neutral cursor-pointer hover:opacity-80">{f}</span>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Titular</th><th>Tipo</th><th>Servicio</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            {contratos.map(c => (
              <tr key={c.id}>
                <td className="font-mono text-xs">{c.id}</td>
                <td>{c.nombre}</td>
                <td>{c.tipoContrato}</td>
                <td>{c.tipoServicio}</td>
                <td><StatusBadge status={c.estado} /></td>
                <td className="text-muted-foreground">{c.fecha}</td>
                <td><Button variant="ghost" size="sm" onClick={() => setDetail(c.id)}><Eye className="h-4 w-4" /></Button></td>
              </tr>
            ))}
            {contratos.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No hay contratos</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Wizard */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Alta de Contrato — Paso {step} de 3</DialogTitle></DialogHeader>
          
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex items-center gap-1 ${s <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{s}</div>
                <span className="text-xs hidden sm:inline">{s === 1 ? 'Selección' : s === 2 ? 'Datos' : 'Confirmar'}</span>
                {s < 3 && <ChevronRight className="h-4 w-4" />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <Select value={form.tomaId} onValueChange={v => setForm({ ...form, tomaId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar toma disponible" /></SelectTrigger>
                <SelectContent>{disponibles.map(t => <SelectItem key={t.id} value={t.id}>{t.id} - {t.ubicacion} ({t.tipo})</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.tipoContrato} onValueChange={v => setForm({ ...form, tipoContrato: v as any })}>
                <SelectTrigger><SelectValue placeholder="Tipo de contrato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agua">Agua</SelectItem>
                  <SelectItem value="Saneamiento">Saneamiento</SelectItem>
                  <SelectItem value="Alcantarillado">Alcantarillado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.tipoServicio} onValueChange={v => setForm({ ...form, tipoServicio: v as any })}>
                <SelectTrigger><SelectValue placeholder="Tipo de servicio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doméstico">Doméstico</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setStep(2)} disabled={!form.tomaId || !form.tipoContrato || !form.tipoServicio} className="w-full">Siguiente</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Input placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              <Input placeholder="RFC" value={form.rfc} onChange={e => setForm({ ...form, rfc: e.target.value })} />
              <Input placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
              <Input placeholder="Contacto (teléfono)" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Atrás</Button>
                <Button onClick={() => setStep(3)} disabled={!form.nombre || !form.rfc} className="flex-1">Siguiente</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
                <h4 className="font-semibold">Resumen del contrato</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Toma:</span> {form.tomaId}</div>
                  <div><span className="text-muted-foreground">Contrato:</span> {form.tipoContrato}</div>
                  <div><span className="text-muted-foreground">Servicio:</span> {form.tipoServicio}</div>
                  <div><span className="text-muted-foreground">Titular:</span> {form.nombre}</div>
                  <div><span className="text-muted-foreground">RFC:</span> {form.rfc}</div>
                  <div><span className="text-muted-foreground">Dirección:</span> {form.direccion}</div>
                  <div><span className="text-muted-foreground">Contacto:</span> {form.contacto}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Atrás</Button>
                <Button onClick={handleCreate} className="flex-1">Crear contrato</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Contrato {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Titular:</span> {selected.nombre}</div>
                <div><span className="text-muted-foreground">RFC:</span> {selected.rfc}</div>
                <div><span className="text-muted-foreground">Toma:</span> {selected.tomaId}</div>
                <div><span className="text-muted-foreground">Tipo:</span> {selected.tipoContrato} / {selected.tipoServicio}</div>
                <div><span className="text-muted-foreground">Medidor:</span> {selected.medidorId || 'Sin asignar'}</div>
                <div><span className="text-muted-foreground">Ruta:</span> {selected.rutaId || 'Sin asignar'}</div>
              </div>
              <StatusBadge status={selected.estado} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contratos;
