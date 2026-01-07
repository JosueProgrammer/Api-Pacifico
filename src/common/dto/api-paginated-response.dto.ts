import { ApiProperty } from '@nestjs/swagger';
import { ApiPaginatedMetaDto } from './api-paginated-meta.dto';

export class ApiPaginatedResponseDto<T> {
  @ApiProperty({
    required: false,
    type: Object,
    description: 'Datos devueltos cuando la operación es exitosa.',
  })
  data?: T[];

  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa.',
  })
  succeeded: boolean;

  @ApiProperty({
    example: 'Operation successful',
    description: 'Título o estado breve de la operación.',
  })
  title: string;

  @ApiProperty({
    example: 'La operación se ejecutó correctamente.',
    description: 'Mensaje detallado del resultado.',
  })
  message: string;

  @ApiProperty({
    type: ApiPaginatedMetaDto,
    description: 'Metadatos de paginación',
  })
  meta: ApiPaginatedMetaDto;

  constructor(data: T[], meta: ApiPaginatedMetaDto, message = '', title = '') {
    this.data = data;
    this.succeeded = true;
    this.message = message;
    this.title = title;
    this.meta = meta;
  }

  static Success<T>(
    data: T[],
    meta: ApiPaginatedMetaDto,
    message = '',
    title = '',
  ): ApiPaginatedResponseDto<T> {
    return new ApiPaginatedResponseDto<T>(data, meta, message, title);
  }
}