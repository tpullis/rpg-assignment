import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostModel } from './model/post.model';
import { CreatePostInput } from './dto/create-post.input';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postModelRepository: Repository<PostModel>,
  ) {}

  async getPosts(id: number) {
    const allPosts = await this.postModelRepository.find({
      where: { author: { id } },
    });
    return allPosts;
  }

  async getTimelineView(): Promise<PostModel[]> {
    const posts = await this.postModelRepository.find({
      take: 10,
      order: { createdAt: 'DESC' },
    });

    return posts;
  }

  async createPost(post: CreatePostInput, authorId: number) {
    const newPost = this.postModelRepository.create({
      ...post,
      author: { id: authorId },
    });
    const saved = await this.postModelRepository.save(newPost);

    return await this.postModelRepository.findOneOrFail({
      where: { id: saved.id },
    });
  }

  async deletePost(id: number, userId: number): Promise<boolean> {
    // `author` is eager-loaded on PostModel, so it's available for the check.
    const post = await this.postModelRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.postModelRepository.delete(id);
    return true;
  }
}
