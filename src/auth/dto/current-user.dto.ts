import { User } from '../../users/entities/users.entity';

export type CurrentUserResDto = {
  user: User | null;
};
