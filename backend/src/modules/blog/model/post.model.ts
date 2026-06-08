import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { User } from '../../users/model/user.model';

@ObjectType()
@Entity()
export class PostModel {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  body: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    eager: true,
  })
  author: User;

  // Exposes the foreign key (authorId) without having to load the full author.
  @Field(() => ID)
  @RelationId((post: PostModel) => post.author)
  authorId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
