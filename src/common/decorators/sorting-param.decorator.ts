import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SortingParam } from '../helpers/typeorm-helpers';

export const SortingParamDecorator = createParamDecorator(
  (allowedFields: string[], ctx: ExecutionContext): SortingParam<any> | null => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    
    if (!query.sortBy || !query.sortOrder) {
      return null;
    }
    
    if (!allowedFields.includes(query.sortBy)) {
      return null;
    }
    
    return {
      field: query.sortBy,
      direction: query.sortOrder.toUpperCase() as 'ASC' | 'DESC',
    };
  },
);


