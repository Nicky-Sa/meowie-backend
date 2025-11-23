import { ForbiddenException, Injectable } from '@nestjs/common';
import { RequestOtpReqDto } from './dto/request-otp.dto';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { VerifyOtpReqDto } from './dto/verify-otp.dto';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../env/env.service';
import {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from './types/jwt.type';
import * as bcrypt from 'bcrypt';

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
      let user = await this.usersService.findOneBy({
        key: 'email',
        value: dto.email,
      });
      let isNewUser = false;
      if (!user) {
        user = await this.usersService.create(dto);
        isNewUser = true;
      }
      // jwt
      const { accessToken, refreshToken } = await this.generateTokens(user.id);
      await this.updateRefreshTokenInDB(user.id, refreshToken);

      return { isNewUser, accessToken, refreshToken };
    }
    throw new ForbiddenException('Invalid OTP');
  }

  /**
   * Implements the rotating token.
   */
  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneBy({
      key: 'id',
      value: userId,
    });
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied: User or token not found');
    }

    // Compare the incoming token with the stored hash
    const isTokenMatch = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isTokenMatch) {
      // This is a critical security measure.
      // If the token doesn't match, it could mean a token was stolen and reused.
      // Invalidate all tokens for this user.
      await this.usersService.update(user.id, { hashedRefreshToken: null });
      throw new ForbiddenException('Access Denied: Token mismatch');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user.id);

    // Store the hash of the *new* refresh token
    await this.updateRefreshTokenInDB(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  private async generateTokens(userId: number) {
    const accessToken = await this.jwtService.signAsync<JwtAccessTokenPayload>(
      {
        sub: userId,
      },
      {
        secret: this.env.get('JWT_SECRET'),
        expiresIn: '15m',
      },
    );
    const refreshToken =
      await this.jwtService.signAsync<JwtRefreshTokenPayload>(
        {
          sub: userId,
        },
        {
          secret: this.env.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      );
    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenInDB(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { hashedRefreshToken });
  }

  async currentUser(userId: number | null) {
    return await this.usersService.findOneBy({
      key: 'id',
      value: userId,
    });
  }
}
