import { CacheService } from './cache.service';
import { Duration } from '../common/app.constants';

type CacheableOptions = {
  key: (...args: any[]) => string;
  ttl?: number;
};

// Define the shape of the class instance (it MUST have cacheService)
type ServiceWithCache = {
  cacheService: CacheService;
};

export const Cacheable = ({
  key,
  ttl = Duration.ONE_DAY,
}: CacheableOptions) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<any>;

    descriptor.value = async function (this: ServiceWithCache, ...args: any[]) {
      const cacheService = this.cacheService;

      if (!cacheService) {
        throw new Error(
          `@Cacheable decorator used, but 'cacheService' is missing on the instance.`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const cacheKey = key(...args);

      // Get from cache
      const cachedValue = await cacheService.get(cacheKey);
      if (cachedValue) {
        return cachedValue;
      }

      // Call original method (using .call to preserve strict typing)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument
      const result = await originalMethod.call(this, ...args);

      // Set cache
      if (result) {
        await cacheService.set(cacheKey, result, ttl);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    };

    return descriptor;
  };
};
