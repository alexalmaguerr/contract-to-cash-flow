import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

/**
 * PATCH /contratos/:id — must align with `ContratosService.update` and global ValidationPipe
 * (whitelist + forbidNonWhitelisted in `main.ts`).
 */
export class UpdateContratoDto {
  @IsOptional() @IsString() ceaNumContrato?: string | null;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsBoolean() domiciliado?: boolean;
  @IsOptional() @IsString() fechaReconexionPrevista?: string | null;
  @IsOptional() @IsBoolean() bloqueadoJuridico?: boolean;
  @IsOptional() @IsString() razonSocial?: string | null;
  @IsOptional() @IsString() regimenFiscal?: string | null;
  @IsOptional() @IsString() constanciaFiscalUrl?: string | null;
  @IsOptional() @IsString() domicilioId?: string | null;
  @IsOptional() @IsString() puntoServicioId?: string | null;
  @IsOptional() @IsString() tipoContratacionId?: string | null;
  @IsOptional() @IsString() zonaId?: string | null;
  @IsOptional() @IsString() rutaId?: string | null;
  @IsOptional() @IsString() fechaBaja?: string | null;
  @IsOptional() @IsString() actividadId?: string | null;
  @IsOptional() @IsString() categoriaId?: string | null;
  @IsOptional() @IsString() referenciaContratoAnterior?: string | null;
  @IsOptional() @IsString() observaciones?: string | null;
  @IsOptional() @IsString() tipoEnvioFactura?: string | null;
  @IsOptional() @IsBoolean() indicadorEmisionRecibo?: boolean;
  @IsOptional() @IsBoolean() indicadorExentarFacturacion?: boolean;
  @IsOptional() @IsBoolean() indicadorContactoCorreo?: boolean;
  @IsOptional() @IsString() cicloFacturacion?: string | null;
  @IsOptional() @IsNumber() superficiePredio?: number | null;
  @IsOptional() @IsNumber() superficieConstruida?: number | null;
  @IsOptional() @IsNumber() mesesAdeudo?: number | null;
  @IsOptional() @IsNumber() unidadesServidas?: number | null;
  @IsOptional() @IsNumber() personasHabitanVivienda?: number | null;

  /** Regeneración / ajuste del HTML almacenado para impresión (opcional). */
  @IsOptional() @IsString() textoContratoSnapshot?: string | null;
}
