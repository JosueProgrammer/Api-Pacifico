import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationParamsDto } from '../dto/pagination-param.dto';

export const PaginationParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParamsDto => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    
    return {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
    } as PaginationParamsDto;
  },
);


