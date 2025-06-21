import { Injectable } from '@nestjs/common';
import pkg from '../package.json';
import { EnvService } from './env/env.service';

@Injectable()
export class AppService {
  constructor(private readonly envService: EnvService) {}

  getInfo(): Record<string, string> {
    return {
      app: pkg.name,
      environment: this.envService.get('BUILD_ENV'),
      version: pkg.version,
    };
  }
}
