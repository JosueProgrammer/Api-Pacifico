import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseQueryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      return {};
    }

    const result: any = {};

    // Parsear parámetros de paginación
    if (value.page) {
      const page = parseInt(value.page);
      if (isNaN(page) || page < 1) {
        throw new BadRequestException(
          'El parámetro "page" debe ser un número positivo',
          'Parámetro inválido'
        );
      }
      result.page = page;
    }

    if (value.limit) {
      const limit = parseInt(value.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new BadRequestException(
          'El parámetro "limit" debe ser un número entre 1 y 100',
          'Parámetro inválido'
        );
      }
      result.limit = limit;
    }

    // Parsear parámetros de ordenamiento
    if (value.sortBy) {
      result.sortBy = value.sortBy;
    }

    if (value.sortOrder) {
      const sortOrder = value.sortOrder.toUpperCase();
      if (!['ASC', 'DESC'].includes(sortOrder)) {
        throw new BadRequestException(
          'El parámetro "sortOrder" debe ser "ASC" o "DESC"',
          'Parámetro inválido'
        );
      }
      result.sortOrder = sortOrder;
    }

    // Parsear parámetros de búsqueda
    if (value.search) {
      result.search = value.search;
    }

    // Parsear filtros JSON
    if (value.filters) {
      try {
        result.filters = JSON.parse(value.filters);
      } catch (error) {
        throw new BadRequestException(
          'El parámetro "filters" debe ser un JSON válido',
          'Filtros inválidos'
        );
      }
    }

    return result;
  }
}
