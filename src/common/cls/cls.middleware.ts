import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from './cls.service';

@Injectable()
export class ClsMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const headerId = req.headers['x-correlation-id'] as string;
    const countryCode = req.headers['x-user-country'] as string;

    this.cls.run(headerId, countryCode, () => {
      res.setHeader('x-correlation-id', this.cls.correlationId);
      next();
    });
  }
}
