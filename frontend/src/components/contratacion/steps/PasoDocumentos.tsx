import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StepProps } from '../hooks/useWizardState';

const CATALOGO_DOCUMENTOS: { id: string; nombre: string }[] = [
  { id: '1',  nombre: 'Certificado de Número Oficial (COPIA)' },
  { id: '2',  nombre: 'Identificación Oficial (COPIA)' },
  { id: '3',  nombre: 'Constancia de Propiedad (ORIGINAL Y COPIA)' },
  { id: '5',  nombre: 'Certificado de Conexión para Toma de Agua (ORIGINAL)' },
  { id: '6',  nombre: 'Póliza de Garantía o Acta de Entrega de la Vivienda (COPIA)' },
  { id: '7',  nombre: 'Acta Constitutiva de la Asociación de Condóminos (COPIA)' },
  { id: '8',  nombre: 'Identificación Oficial del Representante de la Asociación (COPIA)' },
  { id: '9',  nombre: 'Documento que lo Avale como Propietario (COPIA)' },
  { id: '10', nombre: 'Croquis de Ubicación del Predio' },
  { id: '11', nombre: 'Carta de Adhesión y/o Convenio' },
  { id: '12', nombre: 'Expediente Documentos Factibilidades' },
  { id: '13', nombre: 'Expediente Documentos Regularizaciones' },
  { id: '14', nombre: 'Formato de Solicitud de Baja Definitiva (ORIGINAL Y COPIA)' },
  { id: '15', nombre: 'Petición por Escrito (ORIGINAL)' },
  { id: '16', nombre: 'IFE Representante o Titular del Hidrante (COPIA)' },
  { id: '17', nombre: 'IFE del Representante de cada Familia Beneficiada (COPIA)' },
  { id: '18', nombre: 'Solicitud por Escrito' },
  { id: '19', nombre: 'Identificación Oficial del Representante (COPIA)' },
  { id: '20', nombre: 'Identificación Oficial de 2 Testigos (COPIA)' },
  { id: '21', nombre: 'Carta Poder Simple (ORIGINAL)' },
  { id: '22', nombre: 'Acta (COPIA)' },
  { id: '23', nombre: 'RFC (Cédula) (COPIA)' },
  { id: '24', nombre: 'Poder del Representante Legal (COPIA)' },
  { id: '41', nombre: 'Uso de Suelo' },
];

export default function PasoDocumentos({ data, updateData }: StepProps) {
  const [selected, setSelected] = useState('');

  const agregados = data.documentosRecibidos;

  const disponibles = CATALOGO_DOCUMENTOS.filter(
    (d) => !agregados.includes(d.nombre),
  );

  const agregar = () => {
    const doc = CATALOGO_DOCUMENTOS.find((d) => d.id === selected);
    if (!doc) return;
    updateData({ documentosRecibidos: [...agregados, doc.nombre] });
    setSelected('');
  };

  const quitar = (nombre: string) => {
    updateData({ documentosRecibidos: agregados.filter((d) => d !== nombre) });
  };

  return (
    <section aria-labelledby="paso-documentos" className="space-y-4">
      <div>
        <h2 id="paso-documentos" className="text-base font-semibold">Documentos</h2>
        <p className="text-sm text-muted-foreground">
          Seleccione y agregue la documentación recibida.
        </p>
      </div>

      {/* Selector + botón */}
      <div className="space-y-1.5">
        <Label>Documento</Label>
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Seleccionar documento…" />
            </SelectTrigger>
            <SelectContent>
              {disponibles.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nombre}
                </SelectItem>
              ))}
              {disponibles.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Todos los documentos han sido agregados.
                </div>
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            className="bg-[#007BFF] hover:bg-blue-600 text-white shrink-0"
            disabled={!selected}
            onClick={agregar}
          >
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>
      </div>

      {/* Lista de documentos agregados */}
      {agregados.length > 0 ? (
        <ul className="space-y-2">
          {agregados.map((nombre) => (
            <li
              key={nombre}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2.5 text-sm"
            >
              <span className="flex-1">{nombre}</span>
              <button
                type="button"
                onClick={() => quitar(nombre)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Quitar ${nombre}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no se han agregado documentos.
          </p>
        </div>
      )}
    </section>
  );
}
