import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '@/auth/auth.service';
import { RequestOtpReqDto } from '@/auth/dto/request-otp.dto';
import { VerifyOtpReqDto, VerifyOtpResDto } from '@/auth/dto/verify-otp.dto';
import { Response } from 'express';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '@/auth/types/authenticated-request.type';
import {
  RefreshTokenReqDto,
  RefreshTokenResDto,
} from '@/auth/dto/refresh-token.dto';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import { CurrentUserResDto } from '@/auth/dto/current-user.dto';
import { LogoutResDto } from '@/auth/dto/logout.dto';
import {
  DeleteAccountReqDto,
  DeleteAccountResDto,
} from '@/auth/dto/delete-account.dto';
import { RefreshGuard } from '@/auth/guards/refresh.guard';
import { AccessGuard } from '@/auth/guards/access.guard';
import { Duration } from '@/common/app.constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: Duration.ONE_MINUTE * 1000 } })
  async requestOtp(@Body() dto: RequestOtpReqDto): Promise<void> {
    return await this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @Throttle({ short: { limit: 5, ttl: Duration.ONE_MINUTE * 1000 } })
  async verifyOtp(
    @Body() dto: VerifyOtpReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResDto> {
    const data = await this.authService.verifyOtp(dto);
    res.status(data.isNewUser ? HttpStatus.CREATED : HttpStatus.OK);
    return data;
  }

  @RefreshGuard()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenReqDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RefreshTokenResDto> {
    // The user.id is populated by the strategy
    const userId = req.user.id;
    return this.authService.refreshToken(userId, dto.refreshToken);
  }

  @OptionalAccessGuard()
  @Get('current-user')
  @HttpCode(HttpStatus.OK)
  async isAuthenticated(
    @Req() req: OptionallyAuthenticatedRequest,
  ): Promise<CurrentUserResDto> {
    const userId = req.user.id;
    const user = await this.authService.currentUser(userId);
    return { user };
  }

  @AccessGuard()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthenticatedRequest): Promise<LogoutResDto> {
    const userId = req.user.id;
    const successful = await this.authService.logout(userId);
    return { successful };
  }

  @AccessGuard()
  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DeleteAccountReqDto,
  ): Promise<DeleteAccountResDto> {
    const userId = req.user.id;
    const successful = await this.authService.deleteAccount(userId, dto);
    return { successful };
  }
}
