import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../cache/cache.service';
import { EmailService } from '../email/email.service';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {}

  async generateOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();
    const hash = await bcrypt.hash(otp, 10);

    try {
      await this.cacheService.set(`otp:${email}`, hash, 300); // 5-min TTL
      await this.emailService.sendEmail(email, {
        name: 'OtpEmailTemplate',
        data: {
          otp,
          year: new Date().getFullYear().toString(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to send OTP: ${error}`);
    }
  }

  async verifyOtp(email: string, input: string) {
    try {
      const storedHash = await this.cacheService.get(`otp:${email}`);
      if (!storedHash) {
        return false;
      }
      const isValid = await bcrypt.compare(input, storedHash);

      if (isValid) {
        await this.cacheService.del(`otp:${email}`);
      }
      return isValid;
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error}`);
    }
  }
}
