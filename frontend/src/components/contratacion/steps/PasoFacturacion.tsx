import type { StepProps } from '@/components/contratacion/hooks/useWizardState';

const formatMxn = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

interface Concepto {
  id: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  precioUnitario: number;
}

const CONCEPTOS_PRECARGADOS: Concepto[] = [
  { id: 'c1', nombre: 'Derechos de conexión — Agua doméstica',      tipo: 'Fijo',      cantidad: 1, precioUnitario: 1_500 },
  { id: 'c2', nombre: 'Derechos de descarga — Alcantarillado',      tipo: 'Fijo',      cantidad: 1, precioUnitario: 800 },
  { id: 'c3', nombre: 'Instalación de medidor',                     tipo: 'Fijo',      cantidad: 1, precioUnitario: 2_000 },
  { id: 'c4', nombre: 'Inspección y trámite administrativo',        tipo: 'Fijo',      cantidad: 1, precioUnitario: 350 },
  { id: 'c5', nombre: 'Certificación técnica de obra',              tipo: 'Variable',  cantidad: 1, precioUnitario: 200 },
];

const IVA_RATE = 0.16;

export default function PasoFacturacion(_props: StepProps) {
  const subtotal = CONCEPTOS_PRECARGADOS.reduce(
    (s, c) => s + c.cantidad * c.precioUnitario,
    0,
  );
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Facturación</h2>
        <p className="text-sm text-muted-foreground">
          Conceptos de cobro aplicables a este contrato.
        </p>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b text-xs">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Concepto</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tipo</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Cant.</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Precio unitario</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Importe</th>
            </tr>
          </thead>
          <tbody>
            {CONCEPTOS_PRECARGADOS.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2.5 font-medium">{c.nombre}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{c.tipo}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{c.cantidad}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMxn(c.precioUnitario)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {formatMxn(c.cantidad * c.precioUnitario)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-muted/20">
            <tr>
              <td colSpan={4} className="px-4 py-2 text-right text-sm text-muted-foreground">Subtotal</td>
              <td className="px-4 py-2 text-right tabular-nums font-semibold">{formatMxn(subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-4 py-2 text-right text-sm text-muted-foreground">IVA (16%)</td>
              <td className="px-4 py-2 text-right tabular-nums font-semibold">{formatMxn(iva)}</td>
            </tr>
            <tr className="border-t">
              <td colSpan={4} className="px-4 py-2.5 text-right font-semibold">Total</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-base font-bold">{formatMxn(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
