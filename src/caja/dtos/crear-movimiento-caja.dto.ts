import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoMovimientoManual {
  RETIRO = 'retiro',
  DEPOSITO = 'deposito',
}

export class CrearMovimientoCajaDto {
  @ApiProperty({
    description: 'Tipo de movimiento manual',
    enum: TipoMovimientoManual,
    example: TipoMovimientoManual.RETIRO,
  })
  @IsEnum(TipoMovimientoManual, { message: 'El tipo debe ser retiro o deposito' })
  tipo: TipoMovimientoManual;

  @ApiProperty({
    description: 'Monto del movimiento',
    example: 200.00,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número válido con máximo 2 decimales' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @ApiProperty({
    description: 'Concepto o descripción del movimiento',
    example: 'Retiro para cambio',
  })
  @IsString({ message: 'El concepto debe ser texto' })
  concepto: string;

  @ApiPropertyOptional({
    description: 'ID de referencia opcional (venta, devolución, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de referencia debe ser un UUID válido' })
  referenciaId?: string;
}
