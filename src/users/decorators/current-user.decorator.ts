import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  // data is whatver you pass to the decorator
  // context is the request context (can be http, websocket e.t.c)
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // console.log(request.session.userId)
    return request.currentUser
  }
);
