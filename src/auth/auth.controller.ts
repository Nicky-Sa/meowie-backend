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
  AuthenticatedWithRefreshTokenRequest,
} from './types/authenticated-request.type';

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
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: AuthenticatedWithRefreshTokenRequest) {
    // The data now comes from req.user and req.refreshToken, populated by the strategies
    const refreshToken = req.refreshToken;
    const userId = req.user.userId;

    return this.authService.refreshToken(userId, refreshToken);
  }

  @UseGuards(AuthGuard())
  @Get('token-test')
  @HttpCode(HttpStatus.OK)
  protected(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
