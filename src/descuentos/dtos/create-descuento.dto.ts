import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransformTrim } from '../../common/decorators';

export enum TipoDescuento {
  PORCENTAJE = 'porcentaje',
  MONTO_FIJO = 'monto_fijo',
}

export class CreateDescuentoDto {
  @ApiProperty({
    description: 'Código único del descuento/cupón',
    example: 'VERANO2024',
    required: true,
    maxLength: 50,
    minLength: 3,
  })
  @TransformTrim()
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es requerido' })
  @MaxLength(50, { message: 'El código debe tener menos de 50 caracteres' })
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  codigo: string;

  @ApiProperty({
    description: 'Tipo de descuento',
    example: 'porcentaje',
    enum: TipoDescuento,
    required: true,
  })
  @IsEnum(TipoDescuento, { message: 'El tipo debe ser: porcentaje o monto_fijo' })
  @IsNotEmpty({ message: 'El tipo de descuento es requerido' })
  tipo: TipoDescuento;

  @ApiProperty({
    description: 'Valor del descuento (porcentaje 0-100 o monto fijo)',
    example: 15,
    required: true,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @IsNotEmpty({ message: 'El valor es requerido' })
  @Min(0, { message: 'El valor debe ser mayor o igual a 0' })
  valor: number;

  @ApiProperty({
    description: 'Fecha de inicio de vigencia',
    example: '2024-01-01T00:00:00Z',
    required: true,
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin de vigencia',
    example: '2024-12-31T23:59:59Z',
    required: true,
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  fechaFin: string;

  @ApiProperty({
    description: 'Estado activo del descuento',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;

  @ApiProperty({
    description: 'Límite de usos del descuento (null para ilimitado)',
    example: 100,
    required: false,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El límite de uso debe ser un número' })
  @Min(1, { message: 'El límite de uso debe ser mayor a 0' })
  limiteUso?: number;
}
