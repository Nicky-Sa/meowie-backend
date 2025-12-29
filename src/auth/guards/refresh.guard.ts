import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

export const RefreshGuard = () => {
  return applyDecorators(
    UseGuards(AuthGuard('jwt-refresh')),
    ApiBearerAuth('jwt-refresh-docs'),
  );
};
