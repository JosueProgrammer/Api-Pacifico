import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    if (query && Object.keys(query).length > 0) {
      this.logger.debug(`Request Query: ${JSON.stringify(query)}`);
    }

    if (params && Object.keys(params).length > 0) {
      this.logger.debug(`Request Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse<Response>();
          const delay = Date.now() - now;

          this.logger.log(
            `Response: ${method} ${url} - Status: ${response.statusCode} - Duration: ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;

          this.logger.error(
            `Error Response: ${method} ${url} - Error: ${error.message} - Duration: ${delay}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}


