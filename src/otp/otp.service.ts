// otp.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CacheService } from '../cache/cache.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {}

  async generateOtp(userId: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hash = crypto.createHash('sha256').update(otp).digest('hex');

    await this.cacheService.set(`otp:${userId}`, hash, 300); // 5-min TTL
    await this.emailService.sendEmail(userId, {
      name: 'OtpEmailTemplate',
      data: {
        otp,
        year: new Date().getFullYear().toString(),
      },
    });
    return otp;
  }

  async verifyOtp(userId: string, input: string): Promise<boolean> {
    const stored = await this.cacheService.get(`otp:${userId}`);
    if (!stored) return false;

    const hash = crypto.createHash('sha256').update(input).digest('hex');
    const isValid = stored === hash;

    if (isValid) await this.cacheService.del(`otp:${userId}`);
    return isValid;
  }
}
