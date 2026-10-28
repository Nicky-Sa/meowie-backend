import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, IsNull, Repository, UpdateResult } from 'typeorm';
import { User } from '@/user/entities/users.entity';
import { RequestOtpReqDto } from '@/auth/dto/auth.dto';
import { DeleteUserReqDto } from '@/user/dto/delete-user.dto';
import { CurrentUser } from '@/user/dto/current-user.dto';
import { ChurnLog } from '@/user/entities/churn-log.entity';
import { DataSource } from 'typeorm';
import { TasteService } from '@/taste/taste.service';
import {
  IdentityProviderName,
  identityProviderUserIdColumns,
} from '@/auth/identity-providers/identity-provider.type';

type FindOneBy =
  { key: 'email'; value: string | null } | { key: 'id'; value: number | null };

type FindOneOptions = Partial<{
  withRefreshToken: boolean;
}>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly tasteService: TasteService,
  ) {}

  async findOneBy(
    { key, value }: FindOneBy,
    { withRefreshToken }: FindOneOptions = {},
  ): Promise<User | null> {
    // 1. Get the list of ALL property names from the entity metadata
    const metadata = this.usersRepository.metadata;

    // 2. Select every column, omitting hashedRefreshToken unless requested.
    const columnNames = metadata.columns
      .map((column) => column.propertyName as keyof User)
      .filter((name) => withRefreshToken || name !== 'hashedRefreshToken');

    const select = Object.fromEntries(
      columnNames.map((name) => [name, true] as const),
    ) as FindOptionsSelect<User>;

    try {
      // it's using findOneOrFail to catch cases where id is undefined
      return await this.usersRepository.findOneOrFail({
        where: { [key]: value },
        select,
      });
    } catch {
      return null;
    }
  }

  async create(dto: RequestOtpReqDto): Promise<User> {
    try {
      const user = new User();
      user.email = dto.email;
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error creating user: ${message}`,
        {
          cause: error,
        },
      );
    }
  }

  async findOrCreateUserByIdentityProvider(
    identityProviderName: IdentityProviderName,
    identityProviderUserId: string,
    email: string | null,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const userIdColumn = identityProviderUserIdColumns[identityProviderName];
    const user = await this.usersRepository.findOneBy({
      [userIdColumn]: identityProviderUserId,
    });

    if (user) {
      return { user, isNewUser: false };
    }

    if (!email) {
      throw new ForbiddenException(
        'This sign-in needs a verified email address',
      );
    }

    const emailAddress = email.toLowerCase();
    const userWithEmail = await this.findOneBy({
      key: 'email',
      value: emailAddress,
    });

    if (userWithEmail) {
      const existingIdentityProviderUserId = userWithEmail[userIdColumn];

      if (
        existingIdentityProviderUserId &&
        existingIdentityProviderUserId !== identityProviderUserId
      ) {
        throw new ConflictException(
          'A different account is linked to this email',
        );
      }

      if (!existingIdentityProviderUserId) {
        const updateResult = await this.usersRepository.update(
          { id: userWithEmail.id, [userIdColumn]: IsNull() },
          { [userIdColumn]: identityProviderUserId },
        );

        if (updateResult.affected !== 1) {
          throw new ConflictException(
            'Could not link this sign-in. Please try again.',
          );
        }

        // refetch the user from db
        const updatedUser = await this.usersRepository.findOneBy({
          id: userWithEmail.id,
        });

        if (!updatedUser) {
          throw new InternalServerErrorException(
            'Could not load the user after linking the sign-in',
          );
        }

        return { user: updatedUser, isNewUser: false };
      }

      return { user: userWithEmail, isNewUser: false };
    }

    const newUser = new User();
    newUser.email = emailAddress;
    newUser[userIdColumn] = identityProviderUserId;

    try {
      await this.usersRepository.save(newUser);
      return { user: newUser, isNewUser: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error creating user: ${message}`,
        { cause: error },
      );
    }
  }

  async currentUser(userId: number | null): Promise<CurrentUser | null> {
    const user = await this.findOneBy({ key: 'id', value: userId });

    if (!user) {
      return null;
    }

    return {
      ...user,
      hasFilledInTaste: await this.tasteService.hasFilledIn(user.id),
    };
  }

  async deleteUser(userId: number, dto: DeleteUserReqDto) {
    // Start the transaction
    await this.dataSource.transaction(async (manager) => {
      // 1. Find the user using the TRANSACTION manager (locks the row)
      const user = await manager.findOneBy(User, { id: userId });

      if (!user || user.email !== dto.email) {
        throw new ForbiddenException('User not found or email mismatch');
      }

      // 2. Create the log entry
      const churnLog = manager.create(ChurnLog, {
        reason: dto.churnReasonId,
        // Calculate tenure based on user.createdAt
        userTenureInDays: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
      });

      await manager.save(churnLog);

      // 3. Delete the user
      await manager.remove(user);
    });
    return true;
  }

  async update(id: number, updatedProps: Partial<User>): Promise<UpdateResult> {
    return this.usersRepository.update({ id }, updatedProps);
  }
}
