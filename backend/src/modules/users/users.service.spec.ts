import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './model/user.model';
import { CreateUserInput } from './dto/create-user.input';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const repositoryMock = {
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAllUsers', () => {
    it('returns all users from the repository', async () => {
      const users = [{ id: 1, email: 'a@example.com' }] as User[];
      repository.find.mockResolvedValue(users);

      await expect(service.fetchAllUsers()).resolves.toEqual(users);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('emailExists', () => {
    it('returns true when a user with the email exists', async () => {
      repository.count.mockResolvedValue(1);

      await expect(service.emailExists('a@example.com')).resolves.toBe(true);
      expect(repository.count).toHaveBeenCalledWith({
        where: { email: 'a@example.com' },
      });
    });

    it('returns false when no user has the email', async () => {
      repository.count.mockResolvedValue(0);

      await expect(service.emailExists('a@example.com')).resolves.toBe(false);
    });
  });

  describe('createUser', () => {
    const input: CreateUserInput = {
      email: 'new@example.com',
      password: 'password123',
    };

    it('hashes the password and saves a new user when the email is not taken', async () => {
      const built = { ...input } as User;
      const saved = { id: 1, email: input.email } as User;
      repository.count.mockResolvedValue(0);
      repository.create.mockReturnValue(built);
      repository.save.mockResolvedValue(saved);

      await expect(service.createUser(input)).resolves.toEqual(saved);
      expect(repository.save).toHaveBeenCalledWith(built);

      // create() must receive the email unchanged and a bcrypt hash, never the
      // plaintext password.
      const createArg = repository.create.mock.calls[0][0] as Partial<User>;
      expect(createArg.email).toBe(input.email);
      expect(createArg.password).not.toBe(input.password);
      await expect(
        bcrypt.compare(input.password, createArg.password as string),
      ).resolves.toBe(true);
    });

    it('throws BadRequestException when the email is already registered', async () => {
      repository.count.mockResolvedValue(1);

      await expect(service.createUser(input)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
