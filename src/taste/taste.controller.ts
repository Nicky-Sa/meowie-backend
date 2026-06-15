import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { TasteService } from '@/taste/taste.service';
import { AuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { AccessGuard } from '@/auth/guards/access.guard';
import { UpsertTasteReqDto, TasteResDto } from '@/taste/dto/upsert-taste.dto';

@Controller('taste')
export class TasteController {
  constructor(private readonly tasteService: TasteService) {}

  @AccessGuard()
  @Put()
  async upsert(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpsertTasteReqDto,
  ): Promise<TasteResDto> {
    return this.tasteService.upsert(req.user.id, dto);
  }

  @AccessGuard()
  @Get()
  async get(@Req() req: AuthenticatedRequest): Promise<TasteResDto | null> {
    return this.tasteService.findByUserId(req.user.id);
  }
}
