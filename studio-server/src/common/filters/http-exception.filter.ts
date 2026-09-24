import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  method: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Detectar HttpException aunque provenga de otra instancia de @nestjs/common
    const maybeHttp = exception as any;
    const isHttpException =
      exception instanceof HttpException ||
      (maybeHttp &&
        typeof maybeHttp.getStatus === 'function' &&
        typeof maybeHttp.getResponse === 'function');

    const status = isHttpException
      ? maybeHttp.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? (maybeHttp.getResponse() as
          | string
          | {
              statusCode?: number;
              message?: string | string[];
              error?: string;
            })
      : undefined;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse?.message ??
          (isHttpException ? maybeHttp.message : 'Error interno del servidor');

    const error =
      typeof exceptionResponse === 'string'
        ? 'Error'
        : exceptionResponse?.error ??
          (isHttpException ? maybeHttp.name : 'InternalServerError');

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    // Log básico para ayudar a depurar errores de servidor
    if (!isHttpException) {
      // eslint-disable-next-line no-console
      console.error('[HttpExceptionFilter] Unhandled exception:', exception);
    }

    response.status(status).json(errorResponse);
  }
}

