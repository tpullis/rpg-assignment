import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './model/auth-payload.model';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LoginInput } from './dto/login.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  signup(@Args('signupInput') signupInput: CreateUserInput) {
    return this.authService.signup(signupInput);
  }

  @Mutation(() => AuthPayload)
  login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
}
