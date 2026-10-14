import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { RequestHeaders } from '@/common/cls/cls.types';

@Injectable()
export class ClsService {
  private readonly storage = new AsyncLocalStorage<
    Map<string, string | undefined>
  >();

  run(
    { correlationId, countryCode, deviceCode }: RequestHeaders,
    callback: () => void,
  ) {
    const id = correlationId ?? randomUUID();
    const store = new Map([
      ['correlationId', id],
      ['countryCode', countryCode ?? 'US'],
      ['deviceCode', deviceCode],
    ]);
    return this.storage.run(store, callback);
  }

  get correlationId(): string {
    return this.storage.getStore()?.get('correlationId') as string;
  }

  get countryCode(): string {
    return this.storage.getStore()?.get('countryCode') || 'US';
  }

  get deviceCode(): string | undefined {
    return this.storage.getStore()?.get('deviceCode');
  }
}
