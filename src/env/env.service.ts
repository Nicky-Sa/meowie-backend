import { Injectable } from '@nestjs/common';
import { Env, loadEnv } from '@/env/env.config';

@Injectable()
export class EnvService {
  private readonly env: Env = loadEnv();

  get<T extends keyof Env>(key: T): Env[T] {
    return this.env[key];
  }
}
