import { Injectable } from '@nestjs/common';
import { RequestOtpReqDto } from './dto/request-otp.dto';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { VerifyOtpReqDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
  ) {}

  async requestOtp(dto: RequestOtpReqDto) {
    let user = await this.usersService.findOne(dto.email);
    let newUser = false;
    if (!user) {
      user = await this.usersService.create(dto);
      newUser = true;
    }
    await this.otpService.generateOtp(user.email);
    return { newUser };
  }

  async verifyOtp(dto: VerifyOtpReqDto) {
    return this.otpService.verifyOtp(dto.email, dto.otp);
  }
}
