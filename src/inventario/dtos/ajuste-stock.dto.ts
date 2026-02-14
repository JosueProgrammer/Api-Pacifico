import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransformTrim } from '../../common/decorators';

export class AjusteStockDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: string;

  @ApiProperty({
    description: 'Nuevo stock del producto (no puede ser negativo)',
    example: 50,
    required: true,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El nuevo stock debe ser un número' })
  @IsNotEmpty({ message: 'El nuevo stock es requerido' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  nuevoStock: number;

  @ApiProperty({
    description: 'Motivo del ajuste',
    example: 'Ajuste por inventario físico',
    required: true,
  })
  @TransformTrim()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  motivo: string;
}
