import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Route-level parameter decorator that extracts the currently authenticated
 * user from the Express request object (populated by JwtAuthGuard).
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) { return user; }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
