import { Global, Module } from '@nestjs/common';
import { ClsService } from './cls.service';
import { ClsLogger } from './cls-logger.service';

@Global()
@Module({
  providers: [ClsService, ClsLogger],
  exports: [ClsService, ClsLogger],
})
export class ClsModule {}
