import { Test, TestingModule } from '@nestjs/testing';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { PostModel } from './model/post.model';
import { CreatePostInput } from './dto/create-post.input';
import { AuthUser } from '../auth/jwt.strategy';
import { PUB_SUB } from '../pubsub/pubsub.module';

describe('BlogResolver', () => {
  let resolver: BlogResolver;
  let service: jest.Mocked<Pick<BlogService, 'getPosts' | 'createPost'>>;
  let pubSub: { publish: jest.Mock; asyncIterableIterator: jest.Mock };

  beforeEach(async () => {
    const serviceMock = {
      getPosts: jest.fn(),
      createPost: jest.fn(),
    };
    pubSub = {
      publish: jest.fn().mockResolvedValue(undefined),
      asyncIterableIterator: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogResolver,
        { provide: BlogService, useValue: serviceMock },
        { provide: PUB_SUB, useValue: pubSub },
      ],
    }).compile();

    resolver = module.get<BlogResolver>(BlogResolver);
    service = module.get(BlogService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getPosts', () => {
    it('delegates to BlogService.getPosts', async () => {
      const posts = [{ id: 1, title: 'Hi', body: 'Body' }] as PostModel[];
      service.getPosts.mockResolvedValue(posts);

      await expect(resolver.getPosts()).resolves.toEqual(posts);
      expect(service.getPosts).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPost', () => {
    const input: CreatePostInput = { title: 'Hi', body: 'Body' };
    const user: AuthUser = { userId: 7, email: 'a@example.com' };
    const created = { id: 1, title: 'Hi', body: 'Body' } as PostModel;

    it('creates the post and publishes a postCreated event', async () => {
      service.createPost.mockResolvedValue(created);

      await expect(resolver.createPost(input, user)).resolves.toEqual(created);
      expect(service.createPost).toHaveBeenCalledWith(input, user.userId);
      expect(pubSub.publish).toHaveBeenCalledWith('postCreated', {
        postCreated: created,
      });
    });

    it('still returns the post if publishing fails (best-effort)', async () => {
      service.createPost.mockResolvedValue(created);
      pubSub.publish.mockRejectedValue(new Error('redis down'));

      await expect(resolver.createPost(input, user)).resolves.toEqual(created);
    });
  });

  describe('postCreated', () => {
    it('returns the async iterator for the postCreated topic', () => {
      const iterator = {} as AsyncIterableIterator<unknown>;
      pubSub.asyncIterableIterator.mockReturnValue(iterator);

      expect(resolver.postCreated()).toBe(iterator);
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith('postCreated');
    });
  });
});
