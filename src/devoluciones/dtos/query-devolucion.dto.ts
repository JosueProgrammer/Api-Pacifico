import { IsOptional, IsUUID, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDevolucionDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de venta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  ventaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    example: 'procesada',
    enum: ['procesada', 'cancelada'],
  })
  @IsOptional()
  @IsIn(['procesada', 'cancelada'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicio (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Límite por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;
}
