import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') runs our JwtStrategy. By default it looks for the request on
// the REST context; in GraphQL the request lives on the GraphQL context, so we
// override getRequest to hand Passport the right object.
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
