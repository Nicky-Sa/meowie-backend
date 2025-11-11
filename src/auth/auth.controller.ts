import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpReqDto } from './dto/request-otp.dto';
import { VerifyOtpReqDto, VerifyOtpResDto } from './dto/verify-otp.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('request-otp')
  async requestOtp(
    @Body() dto: RequestOtpReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const data = await this.authService.requestOtp(dto);
    res.status(HttpStatus.OK);
    return data;
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
}
