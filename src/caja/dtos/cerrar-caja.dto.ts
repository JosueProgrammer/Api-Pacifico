import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CerrarCajaDto {
  @ApiProperty({
    description: 'Monto final contado físicamente en la caja',
    example: 1500.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto final debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El monto final no puede ser negativo' })
  montoFinal: number;

  @ApiPropertyOptional({
    description: 'Observaciones o notas del arqueo',
    example: 'Cierre sin novedades',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;
}
