import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Method that captures exceptions and returns an HTTP response
   * with a predefined format.
   *
   * @param exception - The captured exception (can be of any type).
   * @param host - The execution context containing details about the request and response.
   */

  catch(exception: any, host: ArgumentsHost) {
    // Get the HTTP request context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message = '';
    let title = '';

    // if the exception is an HttpException, handle specific details
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();

      // Check if the response is an object to extract the message.
      if (typeof responseObj === 'object') {
        const { message: msg, title: ttl } = responseObj as any;
        message = Array.isArray(msg) ? msg.join(', ') : msg;
        title = ttl || '';
      } else {
        message = responseObj as string;
      }
    } else {
      // If it is not an HttpException, set the status code to 500
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Ocurrió un error al procesar la solicitud';
    }

    // Log the error.
    this.logger.error(
      `HTTP status: ${status} Error message: ${message} Path: ${request.url}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Create an error response object.
    const errorResponse = ApiResponseDto.Failure(message, title);

    // Send the response in Json format with the corresponding status code.
    response.status(status).json(errorResponse);
  }
}

