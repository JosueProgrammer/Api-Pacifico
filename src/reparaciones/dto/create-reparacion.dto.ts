import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { EstadoReparacion } from '../../common/entities/reparacion.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReparacionDto {
  @ApiProperty({ description: 'ID del cliente (UUID)', required: false })
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @ApiProperty({ description: 'Tipo de dispositivo (Ej. Smartphone, Tablet)', required: true })
  @IsString()
  dispositivo: string;

  @ApiProperty({ description: 'Marca del dispositivo', required: false })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ description: 'Modelo del dispositivo', required: false })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiProperty({ description: 'Problema reportado por el cliente', required: true })
  @IsString()
  problemaReportado: string;

  @ApiProperty({ description: 'Diagnóstico técnico', required: false })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiProperty({ description: 'Estado actual de la reparación', enum: EstadoReparacion, required: false })
  @IsOptional()
  @IsEnum(EstadoReparacion)
  estado?: EstadoReparacion;

  @ApiProperty({ description: 'Precio estimado brindado al cliente', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioEstimado?: number;

  @ApiProperty({ description: 'Precio final de la reparación', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioFinal?: number;

  @ApiProperty({ description: 'Abono dejado por el cliente', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  abono?: number;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
