import { IsOptional, IsDateString, IsIn, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReporteFilterDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Agrupación temporal',
    enum: ['dia', 'semana', 'mes', 'anio'],
    example: 'dia',
  })
  @IsOptional()
  @IsIn(['dia', 'semana', 'mes', 'anio'])
  agrupar?: 'dia' | 'semana' | 'mes' | 'anio';

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
