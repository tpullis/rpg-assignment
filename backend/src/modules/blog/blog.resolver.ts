import { Mutation, Query, Resolver, Args, Subscription, ID } from '@nestjs/graphql';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions';
import { BlogService } from './blog.service';
import { PostModel } from './model/post.model';
import { CreatePostInput } from './dto/create-post.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/jwt.strategy';
import { PUB_SUB } from '../pubsub/pubsub.module';

// Topic name shared by the publisher and the subscription resolver.
const POST_CREATED = 'postCreated';

@Resolver(() => PostModel)
export class BlogResolver {
  private readonly logger = new Logger(BlogResolver.name);

  constructor(
    private blogService: BlogService,
    @Inject(PUB_SUB) private readonly pubSub: PubSubEngine,
  ) {}

  @Query(() => [PostModel], { name: 'getPostsByUser' })
  async getPosts(@Args('id') id: number): Promise<PostModel[]> {
    return await this.blogService.getPosts(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PostModel)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: AuthUser,
  ): Promise<PostModel> {
    const post = await this.blogService.createPost(
      createPostInput,
      user.userId,
    );
    // Best-effort: a notification failure must never fail the create itself.
    try {
      await this.pubSub.publish(POST_CREATED, { postCreated: post });
    } catch (error) {
      this.logger.error('Failed to publish postCreated event', error);
    }
    return post;
  }

  // Streams every newly created post to all connected clients. The payload key
  // ("postCreated") must match the field name published above.
  @Subscription(() => PostModel)
  postCreated() {
    return this.pubSub.asyncIterableIterator(POST_CREATED);
  }

  // Returns a Boolean: the frontend's `deletePost(id: $id)` has no selection set,
  // so this must resolve to a scalar (not PostModel). The arg is `ID!` to match
  // the post's id type that the client sends.
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deletePost(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    // ID scalars arrive as strings; the column is a numeric primary key.
    return this.blogService.deletePost(Number(id), user.userId);
  }
}
