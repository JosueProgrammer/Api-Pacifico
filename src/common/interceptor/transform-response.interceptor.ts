import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // Si ya es una respuesta formateada, la devolvemos tal como está
        if (data && typeof data === 'object' && 'succeeded' in data) {
          return data as ApiResponseDto<T>;
        }

        // Si es null o undefined, devolvemos una respuesta de éxito sin datos
        if (data === null || data === undefined) {
          return ApiResponseDto.Success(
            data as T,
            'Operación Exitosa',
            'La operación se completó correctamente',
          );
        }

        // Transformamos la respuesta al formato estándar
        return ApiResponseDto.Success(
          data,
          'Operación Exitosa',
          'La operación se completó correctamente',
        );
      }),
    );
  }
}


