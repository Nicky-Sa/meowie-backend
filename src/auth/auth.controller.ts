import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '@/auth/auth.service';
import { AuthResDto } from '@/auth/dto/auth.dto';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import {
  RefreshTokenReqDto,
  RefreshTokenResDto,
} from '@/auth/dto/refresh-token.dto';
import { LogoutResDto } from '@/auth/dto/logout.dto';
import { RefreshGuard } from '@/auth/guards/refresh.guard';
import { AccessGuard } from '@/auth/guards/access.guard';
import { Duration } from '@/common/app.constants';
import {
  RequestOtpReqDto,
  VerifyOtpReqDto,
  ThirdPartyAuthReqDto,
} from '@/auth/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: Duration.ONE_MINUTE * 1000 } })
  async requestOtp(@Body() dto: RequestOtpReqDto): Promise<void> {
    return await this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  @Throttle({ short: { limit: 5, ttl: Duration.ONE_MINUTE * 1000 } })
  async verifyOtp(
    @Body() dto: VerifyOtpReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResDto> {
    const data = await this.authService.verifyOtp(dto);
    res.status(data.isNewUser ? HttpStatus.CREATED : HttpStatus.OK);
    return data;
  }

  @Post('google')
  @Throttle({ short: { limit: 5, ttl: Duration.ONE_MINUTE * 1000 } })
  async googleLogin(
    @Body() dto: ThirdPartyAuthReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResDto> {
    // Reusing the same response dto shape as verifyOtp
    const data = await this.authService.verifyGoogleToken(dto.token);
    res.status(data.isNewUser ? HttpStatus.CREATED : HttpStatus.OK);
    return data;
  }

  @Post('apple')
  @Throttle({ short: { limit: 5, ttl: Duration.ONE_MINUTE * 1000 } })
  async appleLogin(
    @Body() dto: ThirdPartyAuthReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResDto> {
    // Reusing the same response dto shape as verifyOtp
    const data = await this.authService.verifyAppleToken(dto.token);
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

  @AccessGuard()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthenticatedRequest): Promise<LogoutResDto> {
    const userId = req.user.id;
    const successful = await this.authService.logout(userId);
    return { successful };
  }
}
