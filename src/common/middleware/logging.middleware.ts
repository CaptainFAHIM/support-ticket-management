import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Global HTTP request logging middleware.
 *
 * Logs method, URL, status code and response time for every request.
 * Registered in AppModule.configure() for all routes.
 *
 * TODO: Replace with a structured logger (e.g. Winston / Pino) in production.
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const elapsed = Date.now() - start;
      this.logger.log(
        `${method} ${originalUrl} → ${res.statusCode} (${elapsed}ms)`,
      );
    });

    next();
  }
}
