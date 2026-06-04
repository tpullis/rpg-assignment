import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogResolver } from './blog.resolver';
import { PostModel } from './model/post.model';
import { PubSubModule } from '../pubsub/pubsub.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostModel]), PubSubModule],
  providers: [BlogService, BlogResolver],
})
export class BlogModule {}
