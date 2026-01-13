import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { TransformTrim } from '../../common/decorators';

export class UpdateCategoriaDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
    required: false,
    maxLength: 100,
    minLength: 2,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre debe tener menos de 100 caracteres' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Productos electrónicos y dispositivos tecnológicos',
    required: false,
    maxLength: 500,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La descripción debe tener menos de 500 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'URL de la imagen de la categoría',
    example: 'https://example.com/imagen.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL válida' })
  imagen?: string;

  @ApiProperty({
    description: 'Estado activo de la categoría',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
}

