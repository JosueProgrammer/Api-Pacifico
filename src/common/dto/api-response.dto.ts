import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({
    required: false,
    type: Object,
    description: 'Dato devuelto cuando la operación es exitosa.',
  })
  data?: T;

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

  protected constructor(
    data: T | null,
    succeeded: boolean,
    message: string,
    title: string,
  ) {
    this.data = data ?? undefined;
    this.succeeded = succeeded;
    this.message = message;
    this.title = title;
  }

  static Success<T>(data: T, title = '', message = ''): ApiResponseDto<T> {
    return new ApiResponseDto<T>(data, true, message, title);
  }

  static Failure<T>(message: string, title = ''): ApiResponseDto<T> {
    return new ApiResponseDto<T>(null, false, message, title);
  }
}