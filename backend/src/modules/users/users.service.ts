import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './model/user.model';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  private static readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async fetchAllUsers() {
    return await this.userRepository.find({ relations: { posts: true } });
  }

  async createUser(input: CreateUserInput) {
    if (await this.emailExists(input.email)) {
      throw new BadRequestException('Email already registered');
    }

    // bcrypt generates and embeds its own salt inside the hash string.
    const password = await bcrypt.hash(
      input.password,
      UsersService.SALT_ROUNDS,
    );
    const newUser = this.userRepository.create({
      email: input.email,
      password,
    });
    return await this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }
}
