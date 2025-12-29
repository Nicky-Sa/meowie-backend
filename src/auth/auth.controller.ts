import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpReqDto } from './dto/request-otp.dto';
import { VerifyOtpReqDto, VerifyOtpResDto } from './dto/verify-otp.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from './types/authenticated-request.type';
import {
  RefreshTokenReqDto,
  RefreshTokenResDto,
} from './dto/refresh-token.dto';
import { OptionalAuthGuard } from './guards/optional-auth-guard';
import { CurrentUserResDto } from './dto/current-user.dto';
import { LogoutResDto } from './dto/logout.dto';
import {
  DeleteAccountReqDto,
  DeleteAccountResDto,
} from './dto/delete-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpReqDto): Promise<void> {
    return await this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResDto> {
    const data = await this.authService.verifyOtp(dto);
    res.status(data.isNewUser ? HttpStatus.CREATED : HttpStatus.OK);
    return data;
  }

  @UseGuards(AuthGuard('jwt-refresh'))
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

  @UseGuards(OptionalAuthGuard)
  @Get('current-user')
  @HttpCode(HttpStatus.OK)
  async isAuthenticated(
    @Req() req: OptionallyAuthenticatedRequest,
  ): Promise<CurrentUserResDto> {
    const userId = req.user.id;
    const user = await this.authService.currentUser(userId);
    return { user };
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthenticatedRequest): Promise<LogoutResDto> {
    const userId = req.user.id;
    const successful = await this.authService.logout(userId);
    return { successful };
  }

  @UseGuards(AuthGuard('jwt-access'))
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
