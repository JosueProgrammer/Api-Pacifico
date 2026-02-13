import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { TransformTrim } from '../../common/decorators';
import { Type } from 'class-transformer';

export class UpdateProductoDto {
  @ApiProperty({
    description: 'Código de barras del producto',
    example: '1234567890123',
    required: false,
    maxLength: 50,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El código de barras debe tener menos de 50 caracteres' })
  codigoBarras?: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 15',
    required: false,
    maxLength: 200,
    minLength: 2,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El nombre debe tener menos de 200 caracteres' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Laptop de alto rendimiento con procesador Intel i7',
    required: false,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'ID de la categoría a la que pertenece el producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  categoriaId?: string;

  @ApiProperty({
    description: 'ID del proveedor del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  proveedorId?: string;

  @ApiProperty({
    description: 'Precio de venta del producto',
    example: 1299.99,
    required: false,
    minimum: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El precio de venta debe ser un número' })
  @Min(0, { message: 'El precio de venta debe ser mayor o igual a 0' })
  precioVenta?: number;

  @ApiProperty({
    description: 'Precio de compra del producto',
    example: 999.99,
    required: false,
    minimum: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @Min(0, { message: 'El precio de compra debe ser mayor o igual a 0' })
  precioCompra?: number;

  @ApiProperty({
    description: 'Cantidad de stock disponible',
    example: 50,
    required: false,
    minimum: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock?: number;

  @ApiProperty({
    description: 'Stock mínimo requerido para alertas',
    example: 10,
    required: false,
    minimum: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo debe ser mayor o igual a 0' })
  stockMinimo?: number;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://example.com/imagen.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL válida' })
  imagen?: string;

  @ApiProperty({
    description: 'Estado activo del producto',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
}

