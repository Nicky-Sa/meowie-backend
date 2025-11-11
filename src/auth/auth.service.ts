import { Injectable } from '@nestjs/common';
import { RequestOtpReqDto } from './dto/request-otp.dto';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { VerifyOtpReqDto } from './dto/verify-otp.dto';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../env/env.service';
import { User } from '../users/users.entity';
import {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from './models/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private jwtService: JwtService,
    private env: EnvService,
  ) {}

  async requestOtp(dto: RequestOtpReqDto) {
    return this.otpService.generateOtp(dto.email);
  }

  async verifyOtp(dto: VerifyOtpReqDto) {
    const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);
    if (isValid) {
      let user = await this.usersService.findOne(dto.email);
      let isNewUser = false;
      if (!user) {
        user = await this.usersService.create(dto);
        isNewUser = true;
      }
      // jwt
      const { accessToken, refreshToken } = await this.generateTokens(user);

      return { isNewUser, accessToken, refreshToken };
    }
    throw new Error('Invalid OTP');
  }

  async generateTokens(user: User) {
    const accessToken = await this.jwtService.signAsync<JwtAccessTokenPayload>(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.env.get('JWT_SECRET'),
        expiresIn: '15m',
      },
    );
    const refreshToken =
      await this.jwtService.signAsync<JwtRefreshTokenPayload>(
        {
          sub: user.id,
        },
        {
          secret: this.env.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      );
    return { accessToken, refreshToken };
  }
}
