import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from './cls.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const headerId = req.headers['x-correlation-id'] as string;

    this.cls.run(headerId, () => {
      res.setHeader('x-correlation-id', this.cls.correlationId);
      next();
    });
  }
}
