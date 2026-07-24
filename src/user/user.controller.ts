import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Delete,
  Req,
} from '@nestjs/common';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '@/auth/types/authenticated-request.type';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import { AccessGuard } from '@/auth/guards/access.guard';
import { CurrentUserResDto } from '@/user/dto/current-user.dto';
import { DeleteUserReqDto, DeleteUserResDto } from '@/user/dto/delete-user.dto';
import { ChurnReasonsResDto } from '@/user/dto/churn-reasons.dto';
import { CHURN_REASONS } from '@/user/constants/churn-reasons.constant';
import { UserService } from '@/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @OptionalAccessGuard()
  @Get('current')
  @HttpCode(HttpStatus.OK)
  async currentUser(
    @Req() req: OptionallyAuthenticatedRequest,
  ): Promise<CurrentUserResDto> {
    const userId = req.user?.id;
    if (!userId) {
      return { user: null };
    }
    const user = await this.usersService.currentUser(userId);
    return { user };
  }

  @AccessGuard()
  @Delete('current')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DeleteUserReqDto,
  ): Promise<DeleteUserResDto> {
    const userId = req.user.id;
    const successful = await this.usersService.deleteUser(userId, dto);
    return { successful };
  }

  @Get('churn-reasons')
  getChurnReasons(): ChurnReasonsResDto {
    return { reasons: [...CHURN_REASONS] };
  }
}
