import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../utils/request.context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestContext = new RequestContext();
    RequestContext.cls.run(requestContext, () => {
      next();
    });
  }
}


