import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponseDto } from '../dto/api-paginated-response.dto';

export function ApiResponseWithPagination<T>(
  type: new (...args: any[]) => T,
  description: string,
  status: number = 200,
) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      type: ApiPaginatedResponseDto,
    }),
  );
}


