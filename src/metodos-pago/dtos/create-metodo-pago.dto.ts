import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TransformTrim } from '../../common/decorators';

export class CreateMetodoPagoDto {
  @ApiProperty({
    description: 'Nombre del método de pago',
    example: 'Efectivo',
    required: true,
    maxLength: 100,
    minLength: 2,
  })
  @TransformTrim()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre debe tener menos de 100 caracteres' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del método de pago',
    example: 'Pago en efectivo en caja',
    required: false,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'Estado activo del método de pago',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
}
