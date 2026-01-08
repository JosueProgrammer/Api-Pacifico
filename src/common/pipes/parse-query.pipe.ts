import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ERROR_MESSAGES, ERROR_TITLES } from '../constants/error-messages.constants';

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
        throw new BadRequestException(ERROR_MESSAGES.PAGE_MUST_BE_POSITIVE, ERROR_TITLES.INVALID_PARAMETER);
      }
      result.page = page;
    }

    if (value.limit) {
      const limit = parseInt(value.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new BadRequestException(ERROR_MESSAGES.LIMIT_MUST_BE_VALID, ERROR_TITLES.INVALID_PARAMETER);
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
        throw new BadRequestException(ERROR_MESSAGES.SORT_ORDER_INVALID, ERROR_TITLES.INVALID_PARAMETER);
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
        throw new BadRequestException(ERROR_MESSAGES.INVALID_FILTERS_JSON, ERROR_TITLES.INVALID_FILTERS);
      }
    }

    return result;
  }
}


