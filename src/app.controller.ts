import { Controller, Get, Res, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // legacy calls to /
  @Version(VERSION_NEUTRAL)
  @Get()
  root(@Res() res: Response) {
    return res.redirect(301, '/health');
  }

  @Version(VERSION_NEUTRAL)
  @Get('health')
  getHealth(): Record<string, string> {
    return { status: 'ok', ...this.appService.getInfo() };
  }
}
