import {
  ILike,
  In,
  LessThan,
  MoreThan,
  Equal,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  IsNull,
  FindOperator,
} from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '../exceptions/custom-exceptions';
import { ERROR_MESSAGES, ERROR_TITLES } from '../constants/error-messages.constants';

export const validRules = [
  'eq',
  'lt',
  'lte',
  'like',
  'gt',
  'gte',
  'ne',
  'in',
  'nin',
  'null',
  'nnull',
  'nlike',
];

export interface FilteringParam<T> {
  field: keyof T;
  rule: string;
  value: string;
}

export interface SortingParam<T> {
  field: keyof T;
  direction: 'ASC' | 'DESC';
}

export const getWhereConditions = <T>(filter: FilteringParam<T> | null) => {
  if (!filter) return {};

  const { field, rule, value } = filter;

  if (!rule) return {};
  if (!value)
    throw new BadRequestException(
      ERROR_MESSAGES.FILTER_VALUE_REQUIRED,
      ERROR_TITLES.INVALID_PARAMETER,
    );
  if (!field)
    throw new BadRequestException(
      ERROR_MESSAGES.FILTER_FIELD_REQUIRED,
      ERROR_TITLES.INVALID_PARAMETER,
    );

  switch (rule) {
    case 'eq':
      return { [field]: Equal(value) };
    case 'lt':
      return { [field]: LessThan(value) };
    case 'lte':
      return { [field]: LessThanOrEqual(value) };
    case 'like':
      return { [field]: ILike(`%${value}%`) };
    case 'gt':
      return { [field]: MoreThan(value) };
    case 'gte':
      return { [field]: MoreThanOrEqual(value) };
    case 'ne':
      return { [field]: Not(value) };
    case 'in':
      return { [field]: In(value.split(',')) };
    case 'nin':
      return { [field]: Not(In(value.split(','))) };
    case 'null':
      return { [field]: IsNull() };
    case 'nnull':
      return { [field]: Not(IsNull()) };
    case 'nlike':
      return { [field]: Not(ILike(`%${value}%`)) };
    default:
      throw new BadRequestException(
        `${ERROR_MESSAGES.INVALID_FILTER_RULE}: ${rule}. Reglas válidas: ${validRules.join(', ')}`,
        ERROR_TITLES.INVALID_PARAMETER,
      );
  }
};

export const getSortingOrder = <T>(sorting: SortingParam<T> | null) => {
  return sorting ? { [sorting.field]: sorting.direction } : {};
};

export const handleDBErrors = (error: any, notFoundMessage?: string) => {
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException
  ) {
    throw error;
  }

  if (error === null || error === undefined) {
    throw new NotFoundException(
      notFoundMessage || ERROR_MESSAGES.RESOURCE_NOT_FOUND,
      ERROR_TITLES.NOT_FOUND_ERROR,
    );
  }

  if (error.code) {
    switch (error.code) {
      case '23505': // Duplicated entry error
        throw new BadRequestException(
          ERROR_MESSAGES.DUPLICATE_ENTRY,
          ERROR_TITLES.CONFLICT_ERROR,
        );
      case '23503': // Foreign key violation error
        throw new BadRequestException(
          ERROR_MESSAGES.FOREIGN_KEY_VIOLATION,
          ERROR_TITLES.VALIDATION_ERROR,
        );
      case '22P02': // Invalid input syntax error
        throw new BadRequestException(
          ERROR_MESSAGES.INVALID_INPUT_SYNTAX,
          ERROR_TITLES.VALIDATION_ERROR,
        );
      default:
    }
  }

  throw new InternalServerErrorException(
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    ERROR_TITLES.INTERNAL_ERROR,
  );
};

type AndWhereConditions<T> = {
  [K in keyof T]?: FindOperator<any>;
};

export const getAndWhereConditions = <T>(
  filters: FilteringParam<T>[],
) => {
  if (!filters || filters.length === 0) return {};

  const conditions = filters.reduce((acc, filter) => {
    const { field, rule, value } = filter;

    if (!rule) return acc;
    if (!value)
      throw new BadRequestException(
        ERROR_MESSAGES.FILTER_VALUE_REQUIRED,
        ERROR_TITLES.INVALID_PARAMETER,
      );
    if (!field)
      throw new BadRequestException(
        ERROR_MESSAGES.FILTER_FIELD_REQUIRED,
        ERROR_TITLES.INVALID_PARAMETER,
      );

    switch (rule) {
      case 'eq':
        acc[field] = Equal(value);
        break;
      case 'lt':
        acc[field] = LessThan(value);
        break;
      case 'lte':
        acc[field] = LessThanOrEqual(value);
        break;
      case 'like':
        acc[field] = ILike(`%${value}%`);
        break;
      case 'gt':
        acc[field] = MoreThan(value);
        break;
      case 'gte':
        acc[field] = MoreThanOrEqual(value);
        break;
      case 'ne':
        acc[field] = Not(value);
        break;
      case 'in':
        acc[field] = In(value.split(','));
        break;
      case 'nin':
        acc[field] = Not(In(value.split(',')));
        break;
      case 'null':
        acc[field] = IsNull();
        break;
      case 'nnull':
        acc[field] = Not(IsNull());
        break;
      case 'nlike':
        acc[field] = Not(ILike(`%${value}%`));
        break;
      default:
        throw new BadRequestException(
          `${ERROR_MESSAGES.INVALID_FILTER_RULE}: ${rule}. Reglas válidas: ${validRules.join(', ')}`,
          ERROR_TITLES.INVALID_PARAMETER,
        );
    }

    return acc;
  }, {} as AndWhereConditions<T>);

  return conditions;
};


