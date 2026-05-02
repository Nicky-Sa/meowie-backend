import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

@Injectable()
export class ClsService {
  private readonly storage = new AsyncLocalStorage<Map<string, string>>();

  run(correlationId: string | undefined, callback: () => void) {
    const id = correlationId ?? randomUUID();
    const store = new Map([['correlationId', id]]); // new map per request, in case more props are needed to be stored in the future
    return this.storage.run(store, callback);
  }

  get correlationId(): string {
    return this.storage.getStore()?.get('correlationId') as string; // we know it always has the value
  }
}
