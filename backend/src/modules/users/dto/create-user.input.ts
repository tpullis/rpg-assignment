import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(254)
  email: string;

  @Field()
  @MinLength(8)
  password: string;
}
