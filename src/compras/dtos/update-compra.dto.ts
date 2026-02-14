import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum EstadoCompra {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export class UpdateCompraDto {
  @ApiProperty({
    description: 'Estado de la compra',
    example: 'completada',
    enum: EstadoCompra,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoCompra, { message: 'El estado debe ser: pendiente, completada o cancelada' })
  estado?: EstadoCompra;
}
