import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that validates the Bearer JWT token on incoming requests.
 *
 * Extends Passport's built-in 'jwt' strategy guard. On success it populates
 * request.user with the validated JWT payload (see jwt.strategy.ts).
 * On failure it throws UnauthorizedException automatically.
 *
 * Apply per-route or globally via APP_GUARD.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
