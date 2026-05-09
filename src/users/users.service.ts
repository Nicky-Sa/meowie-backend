import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '@/users/entities/users.entity';
import { RequestOtpReqDto } from '@/auth/dto/request-otp.dto';

type FindOneBy =
  | { key: 'email'; value: string | null }
  | { key: 'id'; value: number | null };

type FindOneOptions = Partial<{
  withRefreshToken: boolean;
}>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneBy(
    { key, value }: FindOneBy,
    { withRefreshToken }: FindOneOptions = {},
  ): Promise<User | null> {
    // 1. Get the list of ALL property names from the entity metadata
    const metadata = this.usersRepository.manager.connection.getMetadata(User);

    let select: (keyof User)[] = metadata.columns.map(
      (column) => column.propertyName,
    ) as (keyof User)[];

    // 2. Add the 'hashedRefreshToken' to the list.
    if (!withRefreshToken) {
      select = select.filter((c) => c !== 'hashedRefreshToken');
    }

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

  async update(id: number, updatedProps: Partial<User>): Promise<UpdateResult> {
    return this.usersRepository.update({ id }, updatedProps);
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
