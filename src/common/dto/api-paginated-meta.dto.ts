import { ApiProperty } from '@nestjs/swagger';

export class ApiPaginatedMetaDto {
  @ApiProperty({
    example: 1,
    description: 'Número de página actual',
  })
  currentPage: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  itemsPerPage: number;

  @ApiProperty({
    example: 100,
    description: 'Número total de elementos',
  })
  totalItems: number;

  @ApiProperty({
    example: 10,
    description: 'Número total de páginas',
  })
  totalPages: number;

  @ApiProperty({
    example: true,
    description: 'Indica si hay siguiente página',
  })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si hay página anterior',
  })
  hasPreviousPage: boolean;
}