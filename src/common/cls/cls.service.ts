import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

@Injectable()
export class ClsService {
  private readonly storage = new AsyncLocalStorage<Map<string, string>>();

  run(
    correlationId: string | undefined,
    countryCode: string | undefined,
    callback: () => void,
  ) {
    const id = correlationId ?? randomUUID();
    const store = new Map([
      ['correlationId', id],
      ['countryCode', countryCode ?? 'US'],
    ]);
    return this.storage.run(store, callback);
  }

  get correlationId(): string {
    return this.storage.getStore()?.get('correlationId') as string;
  }

  get countryCode(): string {
    return this.storage.getStore()?.get('countryCode') || 'US';
  }
}
