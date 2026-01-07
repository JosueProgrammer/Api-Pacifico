import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Indica que la operación falló.',
  })
  succeeded: boolean;

  @ApiProperty({
    example: 'Operation failed',
    description: 'Título o estado de la operación fallida.',
  })
  title: string;

  @ApiProperty({
    example: 'Mensaje de error detallando la falla.',
    description: 'Mensaje detallado explicando el resultado de la operación fallida.',
  })
  message: string;

  constructor(message: string, title = 'Operation failed') {
    this.succeeded = false;
    this.message = message;
    this.title = title;
  }
}