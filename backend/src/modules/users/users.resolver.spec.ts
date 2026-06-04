import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User } from './model/user.model';
import { CreateUserInput } from './dto/create-user.input';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let service: jest.Mocked<Pick<UsersService, 'fetchAllUsers' | 'createUser'>>;

  beforeEach(async () => {
    const serviceMock = {
      fetchAllUsers: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUsers', () => {
    it('delegates to UsersService.fetchAllUsers', async () => {
      const users = [{ id: 1, email: 'a@example.com' }] as User[];
      service.fetchAllUsers.mockResolvedValue(users);

      await expect(resolver.getUsers()).resolves.toEqual(users);
      expect(service.fetchAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('delegates to UsersService.createUser with the input', async () => {
      const input: CreateUserInput = {
        email: 'new@example.com',
        password: 'password123',
      };
      const created = { id: 1, ...input } as User;
      service.createUser.mockResolvedValue(created);

      await expect(resolver.createUser(input)).resolves.toEqual(created);
      expect(service.createUser).toHaveBeenCalledWith(input);
    });
  });
});
