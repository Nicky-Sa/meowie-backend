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
import { AuthService } from './auth.service';
import { RequestOtpReqDto } from './dto/request-otp.dto';
import { VerifyOtpReqDto, VerifyOtpResDto } from './dto/verify-otp.dto';
import { Response } from 'express';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from './types/authenticated-request.type';
import {
  RefreshTokenReqDto,
  RefreshTokenResDto,
} from './dto/refresh-token.dto';
import { OptionalAccessGuard } from './guards/optional-access.guard';
import { CurrentUserResDto } from './dto/current-user.dto';
import { LogoutResDto } from './dto/logout.dto';
import {
  DeleteAccountReqDto,
  DeleteAccountResDto,
} from './dto/delete-account.dto';
import { RefreshGuard } from './guards/refresh.guard';
import { AccessGuard } from './guards/access.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async requestOtp(@Body() dto: RequestOtpReqDto): Promise<void> {
    return await this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
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
