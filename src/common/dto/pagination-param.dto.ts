import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsPositive, Min } from 'class-validator';

export class PaginationParamsDto {
  @ApiProperty({
    description: 'Número de página (inicia en 1)',
    example: 1,
    minimum: 1,
    required: true,
  })
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: true,
  })
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit: number = 10;
}