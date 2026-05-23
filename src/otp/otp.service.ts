import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@/email/email.service';
import { randomInt } from 'crypto';
import { CacheService } from '@/cache/cache.service';
import { EnvService } from '@/env/env.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OtpService implements OnModuleInit {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly OTP_EMAIL_TEMPLATE: string;

  constructor(
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
    private readonly env: EnvService,
  ) {
    this.OTP_EMAIL_TEMPLATE = `OtpEmailTemplate-${this.env.get('BUILD_ENV')}`;
  }

  async onModuleInit() {
    await this.syncOtpTemplate();
  }

  async generateOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();
    const hash = await bcrypt.hash(otp, 10);

    try {
      const ttlSeconds = this.OTP_EXPIRY_MINUTES * 60;
      await this.cacheService.set(`otp:${email}`, hash, ttlSeconds);

      await this.emailService.sendEmail(email, {
        name: this.OTP_EMAIL_TEMPLATE,
        data: {
          otp,
          year: new Date().getFullYear().toString(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to send OTP: ${message}`, {
        cause: error,
      });
    }
  }

  async verifyOtp(email: string, input: string) {
    try {
      const redisKey = `otp:${email}`;
      const storedOtp = await this.cacheService.get<string>(redisKey);

      if (!storedOtp) {
        return false;
      }

      const isValid = await bcrypt.compare(input, storedOtp);

      if (isValid) {
        await this.cacheService.del(redisKey);
      }
      return isValid;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to verify OTP: ${message}`,
        { cause: error },
      );
    }
  }

  private async syncOtpTemplate() {
    // Path to the HTML file (will be copied to dist/src/otp by Nest CLI)
    const templatePath = path.join(__dirname, 'otp.template.html');

    try {
      const htmlContent = fs.readFileSync(templatePath, 'utf-8');

      const emailConfig = {
        templateName: this.OTP_EMAIL_TEMPLATE,
        htmlContent,
        subject: 'Your Meowie Verification Code',
        textContent: 'Your Meowie verification code: {{otp}}',
      };

      await this.emailService.syncTemplates(emailConfig);
    } catch (error) {
      console.error('❌ Failed to sync OTP email template on startup:', error);
    }
  }
}
