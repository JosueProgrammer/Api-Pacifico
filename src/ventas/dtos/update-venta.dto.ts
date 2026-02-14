import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum EstadoVenta {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export class UpdateVentaDto {
  @ApiProperty({
    description: 'Estado de la venta',
    example: 'completada',
    enum: EstadoVenta,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoVenta, { message: 'El estado debe ser: pendiente, completada o cancelada' })
  estado?: EstadoVenta;
}
