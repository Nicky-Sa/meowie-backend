import { User } from '../../users/users.entity';

export type CurrentUserResDto = {
  user: User | null;
};
