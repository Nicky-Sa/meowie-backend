import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): Record<string, string> {
    return {
      app: 'meowie-backend',
      version: '0.0.1',
    };
  }
}
