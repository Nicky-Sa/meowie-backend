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
import { DataSource } from 'typeorm';
import { DeleteAccountReqDto } from './dto/delete-account.dto';
import { User } from '../users/entities/users.entity';
import { ChurnLog } from '../users/entities/churn-log.entity';
import type { StringValue } from 'ms';
import { CacheService } from '../cache/cache.service';
import * as crypto from 'crypto';
import { Duration } from '../common/app.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private jwtService: JwtService,
    private env: EnvService,
    private readonly dataSource: DataSource,
    private cacheService: CacheService,
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

      return { isNewUser, accessToken, refreshToken, user };
    }
    throw new ForbiddenException('Invalid OTP');
  }

  /**
   * Implements the rotating token.
   */
  async refreshToken(userId: number, refreshToken: string) {
    // 1. Handle network flakiness with a Grace Period (Idempotency)
    // If the app sent a refresh request but didn't receive the response due to network drop,
    // it will retry with the SAME token. We check if we already rotated this token recently.
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const graceKey = `auth:grace:${userId}:${tokenHash}`;

    const cachedTokens = await this.cacheService.get<{
      accessToken: string;
      refreshToken: string;
    }>(graceKey);

    if (cachedTokens) {
      return cachedTokens;
    }

    const user = await this.usersService.findOneBy(
      {
        key: 'id',
        value: userId,
      },
      { withRefreshToken: true },
    );
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

    // Rotating Refresh Tokens: Store the hash of the *new* refresh token with the new expiry.
    await this.updateRefreshTokenInDB(user.id, newRefreshToken);

    // Store the old token's rotation result in cache for 60 seconds.
    // If the app retries with the same "old" token within a minute, it gets the same result.
    await this.cacheService.set(
      graceKey,
      { accessToken, refreshToken: newRefreshToken },
      Duration.ONE_MINUTE,
    );

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
          expiresIn: this.env.get('JWT_REFRESH_EXPIRY') as StringValue,
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

  async logout(userId: number) {
    const result = await this.usersService.update(userId, {
      hashedRefreshToken: null,
    });
    return result.affected === 1;
  }

  async deleteAccount(userId: number, dto: DeleteAccountReqDto) {
    // Start the transaction
    await this.dataSource.transaction(async (manager) => {
      // 1. Find the user using the TRANSACTION manager (locks the row)
      const user = await manager.findOneBy(User, { id: userId });

      if (!user || user.email !== dto.email) {
        throw new ForbiddenException('User not found or email mismatch');
      }

      // 2. Create the log entry
      const churnLog = manager.create(ChurnLog, {
        reason: dto.churnReasonId,
        // Calculate tenure based on user.createdAt
        userTenureInDays: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
      });

      await manager.save(churnLog);

      // 3. Delete the user
      await manager.remove(user);
    });
    return true;
  }
}
