import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbrirCajaDto {
  @ApiProperty({
    description: 'Monto inicial con el que se abre la caja',
    example: 500.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto inicial debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  montoInicial: number;

  @ApiProperty({
    description: 'Observaciones o comentarios al abrir la caja',
    example: 'Inicio de turno mañana',
    required: false,
  })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  observaciones?: string;
}
