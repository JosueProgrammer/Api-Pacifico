import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransformTrim } from '../../common/decorators';

export class DetalleCompraDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: string;

  @ApiProperty({
    description: 'Cantidad de productos a comprar',
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
    description: 'Precio unitario de compra',
    example: 50.00,
    required: true,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @IsNotEmpty({ message: 'El precio unitario es requerido' })
  @Min(0, { message: 'El precio unitario debe ser mayor o igual a 0' })
  precioUnitario: number;
}

export class CreateCompraDto {
  @ApiProperty({
    description: 'Número de factura del proveedor',
    example: 'FAC-001-2024',
    required: false,
    maxLength: 100,
  })
  @TransformTrim()
  @IsOptional()
  @IsString({ message: 'El número de factura debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El número de factura debe tener menos de 100 caracteres' })
  numeroFactura?: string;

  @ApiProperty({
    description: 'ID del proveedor',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del proveedor es requerido' })
  proveedorId: string;

  @ApiProperty({
    description: 'Porcentaje de impuesto aplicado',
    example: 15.00,
    required: false,
    default: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El impuesto debe ser un número' })
  @Min(0, { message: 'El impuesto debe ser mayor o igual a 0' })
  impuesto?: number;

  @ApiProperty({
    description: 'Lista de productos de la compra',
    type: [DetalleCompraDto],
    required: true,
  })
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[];
}
