import { Injectable } from '@nestjs/common';
import pkg from '../package.json';

@Injectable()
export class AppService {
  getInfo(): Record<string, string> {
    return {
      app: pkg.name,
      version: pkg.version,
    };
  }
}
