import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();
  use(req: Request, res: Response, next: NextFunction) {
    const morganStream = {
      write: (message: string) => {
        this.logger.log(message.trim());
      },
    };
    morgan('dev', { stream: morganStream })(req, res, next);
  }
}
