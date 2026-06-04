import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LoginInput } from './dto/login.input';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let service: jest.Mocked<Pick<AuthService, 'signup' | 'login'>>;

  beforeEach(async () => {
    service = { signup: jest.fn(), login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: service },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('signup delegates to AuthService.signup', async () => {
    const input: CreateUserInput = {
      email: 'a@example.com',
      password: 'password123',
    };
    service.signup.mockResolvedValue({ accessToken: 'token' });

    await expect(resolver.signup(input)).resolves.toEqual({
      accessToken: 'token',
    });
    expect(service.signup).toHaveBeenCalledWith(input);
  });

  it('login delegates to AuthService.login', async () => {
    const input: LoginInput = {
      email: 'a@example.com',
      password: 'password123',
    };
    service.login.mockResolvedValue({ accessToken: 'token' });

    await expect(resolver.login(input)).resolves.toEqual({
      accessToken: 'token',
    });
    expect(service.login).toHaveBeenCalledWith(input);
  });
});
