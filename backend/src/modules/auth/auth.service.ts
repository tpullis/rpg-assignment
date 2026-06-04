import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './model/auth-payload.model';
import { User } from '../users/model/user.model';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Create the account (UsersService hashes + rejects duplicates) and log in.
  async signup(input: CreateUserInput): Promise<AuthPayload> {
    const user = await this.usersService.createUser(input);
    return this.issueToken(user);
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.validateUser(input.email, input.password);
    return this.issueToken(user);
  }

  // Look up the user and verify the password against the stored bcrypt hash.
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Same error for "no such user" and "wrong password" so we don't leak
      // which emails are registered.
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private issueToken(user: User): AuthPayload {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
