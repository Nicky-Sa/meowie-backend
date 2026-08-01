import { User } from '@/user/entities/users.entity';

export type CurrentUser = User & { hasFilledInTaste: boolean };

export class CurrentUserResDto {
  user: CurrentUser | null;
}
