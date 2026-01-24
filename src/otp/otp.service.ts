import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 5;

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly emailService: EmailService,
  ) {}

  async generateOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();
    const hash = await bcrypt.hash(otp, 10);

    try {
      await this.otpRepository.upsert({ email, otp: hash }, ['email']);
      await this.emailService.sendEmail(email, {
        name: 'OtpEmailTemplate',
        data: {
          otp,
          year: new Date().getFullYear().toString(),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to send OTP: ${error}`);
    }
  }

  async verifyOtp(email: string, input: string) {
    try {
      const storedOtpItem = await this.otpRepository.findOne({
        where: { email },
      });
      if (!storedOtpItem || !storedOtpItem.otp) {
        return false;
      }

      const isExpired = this.isExpired(
        storedOtpItem.updatedAt,
        this.OTP_EXPIRY_MINUTES,
      );
      if (isExpired) {
        await this.otpRepository.delete({ email });
        return false;
      }

      const storedOtp = storedOtpItem.otp;
      const isValid = await bcrypt.compare(input, storedOtp);

      if (isValid) {
        await this.otpRepository.delete({ email });
      }
      return isValid;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to verify OTP: ${error}`);
    }
  }

  private isExpired(createdAt: Date, expiryMinutes: number) {
    const diff = Date.now() - createdAt.getTime();
    const minutesPassed = Math.floor(diff / (1000 * 60));
    return minutesPassed > expiryMinutes;
  }
}
