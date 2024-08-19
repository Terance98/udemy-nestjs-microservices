import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@app/common';

// We are able to get the user from the http request, since passport local strategy is injecting it into the request object
const getCurrentUserByContext = (context: ExecutionContext): User => {
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
