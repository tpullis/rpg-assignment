import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/model/user.model';
import { CreateUserInput } from '../users/dto/create-user.input';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'createUser' | 'findByEmail'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    usersService = { createUser: jest.fn(), findByEmail: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('creates the user and returns an access token', async () => {
      const input: CreateUserInput = {
        email: 'a@example.com',
        password: 'password123',
      };
      usersService.createUser.mockResolvedValue({
        id: 1,
        email: input.email,
      } as User);

      await expect(service.signup(input)).resolves.toEqual({
        accessToken: 'signed.jwt.token',
      });
      expect(usersService.createUser).toHaveBeenCalledWith(input);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: input.email,
      });
    });
  });

  describe('login', () => {
    const password = 'password123';
    let user: User;

    beforeEach(async () => {
      user = {
        id: 1,
        email: 'a@example.com',
        password: await bcrypt.hash(password, 10),
      } as User;
    });

    it('returns an access token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password }),
      ).resolves.toEqual({ accessToken: 'signed.jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: user.email,
      });
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
