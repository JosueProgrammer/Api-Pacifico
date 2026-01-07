import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';

export function ApiResponseWithData(
  dataDto: Type<unknown> | null,
  description: string,
  status = 200,
) {
  if (status === HttpStatus.NO_CONTENT) {
    return applyDecorators(
      ApiExtraModels(ApiResponseDto),
      ApiResponse({
        status,
        description,
        schema: { $ref: getSchemaPath(ApiResponseDto) },
      }),
    );
  }

  if (!dataDto) {
    return applyDecorators(
      ApiExtraModels(ApiErrorResponseDto),
      ApiResponse({
        status,
        description,
        schema: { $ref: getSchemaPath(ApiErrorResponseDto) },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(ApiResponseDto, dataDto),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );
}


