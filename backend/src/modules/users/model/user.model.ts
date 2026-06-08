import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { PostModel } from '../../blog/model/post.model';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  // No @Field(): the password hash must never be exposed through GraphQL.
  @Column()
  password: string;

  @Field(() => [PostModel], { nullable: true })
  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
