import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  private readonly logger: Logger = new Logger(UsersRepository.name, {
    timestamp: true,
  });

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = this.create({ username, password: hashedPassword });
      await this.save(user);
    } catch (e) {
      // duplicated username
      if (e.code === '23505') {
        this.logger.error('Username already exists', e.stack);
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error(`Error creating user: ${username} `, e.stack);
        throw new InternalServerErrorException();
      }
    }
  }
}
