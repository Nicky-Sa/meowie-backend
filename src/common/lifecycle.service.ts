import {
  Injectable,
  OnApplicationShutdown,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';

@Injectable()
export class LifecycleService
  implements OnModuleDestroy, OnApplicationShutdown
{
  private readonly logger = new Logger(LifecycleService.name);

  onModuleDestroy() {
    this.logger.log('📦 Module destruction started...');
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`🛑 Application shutting down (Signal: ${signal})...`);
    // This is where you'd add a hard timeout if you didn't trust the hooks
    // but NestJS hooks are generally reliable.
    // For a real senior touch, we ensure the process exits even if something hangs.
    setTimeout(() => {
      this.logger.error('⚠️ Shutdown hanging, forcing exit.');
      process.exit(1);
    }, 10000).unref(); // .unref() allows the process to exit even if the timer is active
  }
}
