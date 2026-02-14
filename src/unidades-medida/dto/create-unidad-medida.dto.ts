import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoUnidad } from '../../common/entities/unidad-medida.entity';

export class CreateUnidadMedidaDto {
  @ApiProperty({ description: 'Nombre de la unidad de medida', example: 'Kilogramo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ description: 'Abreviatura de la unidad', example: 'kg', maxLength: 10 })
  @IsString()
  @IsNotEmpty({ message: 'La abreviatura es requerida' })
  @MaxLength(10, { message: 'La abreviatura no puede exceder 10 caracteres' })
  abreviatura: string;

  @ApiPropertyOptional({ description: 'Tipo de unidad', enum: TipoUnidad, default: TipoUnidad.UNIDAD })
  @IsEnum(TipoUnidad, { message: 'El tipo debe ser: unidad, peso, volumen o longitud' })
  @IsOptional()
  tipo?: TipoUnidad;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo', default: true })
  @IsOptional()
  activo?: boolean;
}
