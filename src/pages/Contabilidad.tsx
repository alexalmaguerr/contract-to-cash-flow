import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { PieChart, FileText, Send } from 'lucide-react';

const Contabilidad = () => {
  const { pagos, preFacturas, timbrados } = useData();

  const totalFacturado = preFacturas.filter(pf => pf.estado === 'Aceptada').reduce((s, pf) => s + pf.total, 0);
  const totalCobrado = pagos.reduce((s, p) => s + p.monto, 0);
  const totalTimbrado = timbrados.filter(t => t.estado === 'Timbrada OK').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contabilidad</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="widget-card text-center">
          <PieChart className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">${totalFacturado.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Total facturado</p>
        </div>
        <div className="widget-card text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold">${totalCobrado.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Total cobrado</p>
        </div>
        <div className="widget-card text-center">
          <Send className="h-8 w-8 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{totalTimbrado}</p>
          <p className="text-sm text-muted-foreground">CFDIs timbrados</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="widget-card">
          <h3 className="section-title">Generación de pólizas</h3>
          <p className="text-sm text-muted-foreground mb-4">Genera pólizas contables del periodo actual</p>
          <Button variant="outline">Generar pólizas (simulado)</Button>
        </div>

        <div className="widget-card">
          <h3 className="section-title">Envío a SAP</h3>
          <p className="text-sm text-muted-foreground mb-4">Envía la información contable al sistema SAP</p>
          <Button variant="outline">Enviar a SAP (simulado)</Button>
        </div>
      </div>

      <div className="mt-6 widget-card">
        <h3 className="section-title">Reportes</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" size="sm">Reporte de ingresos</Button>
          <Button variant="outline" size="sm">Reporte de cartera vencida</Button>
          <Button variant="outline" size="sm">Reporte de facturación</Button>
          <Button variant="outline" size="sm">Reporte de cobranza</Button>
        </div>
      </div>
    </div>
  );
};

export default Contabilidad;
