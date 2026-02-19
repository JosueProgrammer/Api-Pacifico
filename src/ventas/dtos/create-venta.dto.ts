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
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoVenta {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  BORRADOR = 'borrador',
}

export class DetalleVentaDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: string;

  @ApiProperty({
    description: 'Cantidad de productos (soporta decimales para unidades de peso/volumen)',
    example: 2.5,
    required: true,
    minimum: 0.001,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'La cantidad debe ser un número con máximo 3 decimales' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Min(0.001, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @ApiProperty({
    description: 'Descuento aplicado al producto',
    example: 10.00,
    required: false,
    default: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @Min(0, { message: 'El descuento debe ser mayor o igual a 0' })
  descuento?: number;
}

export class CreateVentaDto {
  @ApiProperty({
    description: 'ID del cliente (opcional para ventas anónimas)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  clienteId?: string;

  @ApiProperty({
    description: 'ID del método de pago',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del método de pago debe ser un UUID válido' })
  metodoPagoId?: string;

  @ApiProperty({
    description: 'Descuento general aplicado a la venta (manual)',
    example: 50.00,
    required: false,
    default: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @Min(0, { message: 'El descuento debe ser mayor o igual a 0' })
  descuento?: number;

  @ApiProperty({
    description: 'Código de descuento/cupón a aplicar',
    example: 'VERANO2024',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El código de descuento debe ser una cadena de texto' })
  codigoDescuento?: string;

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
    description: 'Lista de productos de la venta',
    type: [DetalleVentaDto],
    required: true,
  })
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];

  @ApiProperty({
    description: 'Estado de la venta (opcional)',
    enum: EstadoVenta,
    default: EstadoVenta.COMPLETADA,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoVenta, { message: 'El estado debe ser uno de los valores permitidos' })
  estado?: EstadoVenta;
}
