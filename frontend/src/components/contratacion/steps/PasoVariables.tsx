import type { StepProps } from '../hooks/useWizardState';

export default function PasoVariables(_props: StepProps) {
  return (
    <section aria-labelledby="paso-variables" className="space-y-3">
      <div>
        <h2 id="paso-variables" className="text-base font-semibold">Variables</h2>
        <p className="text-sm text-muted-foreground">
          Configuración de variables de facturación.
        </p>
      </div>
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">Sin variables configuradas para este tipo de contratación.</p>
      </div>
    </section>
  );
}
