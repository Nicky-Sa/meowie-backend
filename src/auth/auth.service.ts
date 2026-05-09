import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { RequestOtpReqDto } from '@/auth/dto/request-otp.dto';
import { UsersService } from '@/users/users.service';
import { OtpService } from '@/otp/otp.service';
import { VerifyOtpReqDto } from '@/auth/dto/verify-otp.dto';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '@/env/env.service';
import {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from '@/auth/types/jwt.type';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { DeleteAccountReqDto } from '@/auth/dto/delete-account.dto';
import { User } from '@/users/entities/users.entity';
import { ChurnLog } from '@/users/entities/churn-log.entity';
import type { StringValue } from 'ms';
import { CacheService } from '@/cache/cache.service';
import * as crypto from 'crypto';
import { Duration } from '@/common/app.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
   * Implements the rotating refresh token.
   *
   * Validation order:
   * 1. Grace cache (Redis, 5 min) — handles retries after a lost response
   * 2. Current hash (DB) — normal flow
   * 3. Mismatch — stolen token, delete the current hash from DB
   */
  async refreshToken(userId: number, refreshToken: string) {
    // 1. Grace Period (Idempotency)
    // If the app sent a refresh request but didn't receive the response due to network drop,
    // it will retry with the SAME token. We check if we already rotated this token recently.
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const graceKey = `auth:grace:${userId}:${tokenHash}`; // built with the old refreshToken

    const cachedEncrypted = await this.cacheService.get<string>(graceKey);

    if (cachedEncrypted) {
      return this.decryptTokens(cachedEncrypted);
    }

    // 2. Fetch user and validate against the current hash
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
      // Token doesn't match and wasn't in the grace cache — likely stolen.
      // Invalidate all tokens for this user.
      this.logger.warn(
        `Refresh token mismatch for user ${userId}. Invalidating all sessions.`,
      );
      await this.usersService.update(user.id, { hashedRefreshToken: null });
      throw new ForbiddenException('Access Denied: Token mismatch');
    }

    // 3. Generate new tokens (rotate)
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user.id);

    // Rotating Refresh Tokens: Store the hash of the *new* refresh token.
    await this.updateRefreshTokenInDB(user.id, newRefreshToken);

    // Store the old token's rotation result (encrypted) in cache for 5 minutes.
    // If the app retries with the same "old" token within this window, it gets the same result.
    // 5 minutes accounts for slow mobile networks and app backgrounding.
    const tokens = { accessToken, refreshToken: newRefreshToken };
    await this.cacheService.set(
      graceKey,
      this.encryptTokens(tokens),
      Duration.FIVE_MINUTES,
    );

    return tokens;
  }

  /** Derives a stable 32-byte AES key from JWT_REFRESH_SECRET. */
  private getEncryptionKey(): Buffer {
    return crypto
      .createHash('sha256')
      .update(this.env.get('JWT_REFRESH_SECRET'))
      .digest();
  }

  /** AES-256-GCM encrypt a token pair for safe Redis storage. */
  private encryptTokens(tokens: {
    accessToken: string;
    refreshToken: string;
  }): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      iv,
    );
    const plaintext = JSON.stringify(tokens);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Pack: iv (12) + authTag (16) + ciphertext → base64
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  /** Decrypt a token pair from Redis. */
  private decryptTokens(packed: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const buf = Buffer.from(packed, 'base64');
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      iv,
    );
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8')) as {
      accessToken: string;
      refreshToken: string;
    };
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
