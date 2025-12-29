import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

export const AccessGuard = () => {
  return applyDecorators(
    UseGuards(PassportAuthGuard('jwt-access')),
    ApiBearerAuth('jwt-access-docs'), // Matches the name in your main.ts
  );
};
