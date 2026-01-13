import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationParamsDto } from '../../common/dto/pagination-param.dto';
import { FilteringParam, SortingParam } from '../../common/helpers/typeorm-helpers';
import { Categoria } from '../../common/entities/categoria.entity';

export class QueryCategoriaDto extends PaginationParamsDto {
  @ApiProperty({
    description: 'Filtrar solo categorías activas',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El parámetro activo debe ser un valor booleano' })
  activo?: boolean;

  @ApiProperty({
    description: 'Filtros avanzados para la búsqueda (JSON string)',
    example: '[{"field":"nombre","rule":"like","value":"elec"}]',
    required: false,
  })
  @IsOptional()
  @IsString()
  filters?: string;

  @ApiProperty({
    description: 'Campo para ordenamiento',
    example: 'nombre',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Dirección de ordenamiento (ASC o DESC)',
    example: 'ASC',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

