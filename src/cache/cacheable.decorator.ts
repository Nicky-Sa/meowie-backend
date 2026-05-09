import { CacheService } from '@/cache/cache.service';
import { Duration } from '@/common/app.constants';

type CacheableOptions<T extends unknown[]> = {
  key: (...args: T) => string;
  ttl?: number;
};

// Define the shape of the class instance (it MUST have cacheService)
type ServiceWithCache = {
  cacheService: CacheService;
};

export const Cacheable = <T extends unknown[], R>({
  key,
  ttl = Duration.ONE_DAY,
}: CacheableOptions<T>) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>,
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod) return;

    descriptor.value = async function (
      this: ServiceWithCache,
      ...args: T
    ): Promise<R> {
      const cacheService = this.cacheService;

      if (!cacheService) {
        throw new Error(
          `@Cacheable decorator used, but 'cacheService' is missing on the instance.`,
        );
      }

      const cacheKey = key(...args);

      // Get from cache
      const cachedValue = (await cacheService.get(cacheKey)) as R;
      if (cachedValue) {
        return cachedValue;
      }

      // Call original method
      const result = (await originalMethod.call(this, ...args)) as R;

      // Set cache
      if (result) {
        await cacheService.set(cacheKey, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
};
