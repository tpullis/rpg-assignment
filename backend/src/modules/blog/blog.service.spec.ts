import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogService } from './blog.service';
import { PostModel } from './model/post.model';
import { CreatePostInput } from './dto/create-post.input';

describe('BlogService', () => {
  let service: BlogService;
  let repository: jest.Mocked<Repository<PostModel>>;

  beforeEach(async () => {
    const repositoryMock = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getRepositoryToken(PostModel), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    repository = module.get(getRepositoryToken(PostModel));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPosts', () => {
    it('returns all posts from the repository', async () => {
      const posts = [{ id: 1, title: 'Hi', body: 'Body' }] as PostModel[];
      repository.find.mockResolvedValue(posts);

      await expect(service.getPosts()).resolves.toEqual(posts);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPost', () => {
    it('links the author by id, saves, and returns the reloaded post', async () => {
      const input: CreatePostInput = { title: 'Hi', body: 'Body' };
      const authorId = 7;
      const built = { ...input } as PostModel;
      const saved = { id: 1, ...input } as PostModel;
      const reloaded = { id: 1, ...input, authorId } as PostModel;
      repository.create.mockReturnValue(built);
      repository.save.mockResolvedValue(saved);
      repository.findOneOrFail.mockResolvedValue(reloaded);

      await expect(service.createPost(input, authorId)).resolves.toEqual(
        reloaded,
      );
      expect(repository.create).toHaveBeenCalledWith({
        ...input,
        author: { id: authorId },
      });
      expect(repository.save).toHaveBeenCalledWith(built);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: saved.id },
      });
    });
  });
});
