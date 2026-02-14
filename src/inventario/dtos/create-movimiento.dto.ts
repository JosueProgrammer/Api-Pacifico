import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransformTrim } from '../../common/decorators';

export enum TipoMovimiento {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
}

export class CreateMovimientoDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: string;

  @ApiProperty({
    description: 'Tipo de movimiento',
    example: 'ajuste',
    enum: TipoMovimiento,
    required: true,
  })
  @IsEnum(TipoMovimiento, { message: 'El tipo debe ser: entrada, salida o ajuste' })
  @IsNotEmpty({ message: 'El tipo de movimiento es requerido' })
  tipoMovimiento: TipoMovimiento;

  @ApiProperty({
    description: 'Cantidad del movimiento (siempre positiva)',
    example: 10,
    required: true,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @ApiProperty({
    description: 'Motivo del movimiento',
    example: 'Ajuste por inventario físico',
    required: true,
  })
  @TransformTrim()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  motivo: string;

  @ApiProperty({
    description: 'ID de referencia (venta, compra, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de referencia debe ser un UUID válido' })
  referenciaId?: string;
}
