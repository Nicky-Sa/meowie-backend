import { Global, Module } from '@nestjs/common';
import { ClsService } from '@/common/cls/cls.service';
import { ClsLogger } from '@/common/cls/cls-logger.service';

@Global()
@Module({
  providers: [ClsService, ClsLogger],
  exports: [ClsService, ClsLogger],
})
export class ClsModule {}
