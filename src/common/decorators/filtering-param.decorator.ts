import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FilteringParam } from '../helpers/typeorm-helpers';

export const FilteringParamDecorator = createParamDecorator(
  (allowedFields: string[], ctx: ExecutionContext): FilteringParam<any> | null => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    
    if (!query.filters) {
      return null;
    }
    
    try {
      const filters = JSON.parse(query.filters);
      const filterKeys = Object.keys(filters);
      
      // Check if all filter keys are in allowed fields
      const validFilters = filterKeys.filter(key => allowedFields.includes(key));
      
      if (validFilters.length === 0) {
        return null;
      }
      
      // Return the first valid filter (you might want to handle multiple filters differently)
      const firstKey = validFilters[0];
      return {
        field: firstKey,
        rule: 'eq', // Default rule, you might want to make this configurable
        value: filters[firstKey],
      };
    } catch (error) {
      return null;
    }
  },
);


