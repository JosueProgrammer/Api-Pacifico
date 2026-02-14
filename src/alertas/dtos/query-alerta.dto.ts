import { IsOptional, IsString, IsBoolean, IsIn, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryAlertaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de alerta',
    enum: ['stock_bajo', 'stock_agotado', 'descuento_expira'],
  })
  @IsOptional()
  @IsIn(['stock_bajo', 'stock_agotado', 'descuento_expira'])
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de lectura',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  leida?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
