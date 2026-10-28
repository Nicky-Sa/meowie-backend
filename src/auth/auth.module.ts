import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { AuthController } from '@/auth/auth.controller';
import { UserModule } from '@/user/user.module';
import { OtpModule } from '@/otp/otp.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from '@/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@/auth/strategies/refresh-token.strategy';
import { AppleIdentityProvider } from '@/auth/identity-providers/apple.identity-provider';
import { GoogleIdentityProvider } from '@/auth/identity-providers/google.identity-provider';

const identityProviders = [AppleIdentityProvider, GoogleIdentityProvider];

@Module({
  imports: [
    UserModule,
    OtpModule,
    JwtModule.register({}), // for generating tokens
    PassportModule.register({ defaultStrategy: 'jwt-access' }), // for validating tokens and attaching user to request (@UseGuards(AccessGuard(...)))
  ],
  providers: [
    AuthService,
    ...identityProviders,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
