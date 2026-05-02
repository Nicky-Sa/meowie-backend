import { Controller, Get, Res, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  // legacy calls to /
  @Version(VERSION_NEUTRAL)
  @Get()
  root(@Res() res: Response) {
    return res.redirect(301, '/health');
  }
}
