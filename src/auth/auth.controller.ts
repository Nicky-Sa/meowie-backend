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
import { AuthenticatedRequest } from './types/authenticated-request.type';
import {
  RefreshTokenReqDto,
  RefreshTokenResDto,
} from './dto/refresh-token.dto';

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

  @UseGuards(AuthGuard())
  @Get('is-authenticated')
  @HttpCode(HttpStatus.OK)
  isAuthenticated() {
    return { isAuthenticated: true }; // if we get here (pass the guard), the user is authenticated
  }
}
