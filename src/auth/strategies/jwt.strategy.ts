import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

/**
 * JwtStrategy — Passport strategy for validating Bearer tokens.
 *
 * Passport extracts the token from the Authorization header, verifies its
 * signature using the JWT_SECRET, and calls validate() with the decoded
 * payload. Whatever validate() returns is attached to request.user.
 *
 * NOTE: Token blacklisting / refresh-token rotation should be added here
 * when implementing production auth.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'changeme',
    });
  }

  /**
   * Called after signature verification succeeds.
   * Returning the payload here sets request.user for downstream handlers.
   *
   * TODO: Optionally query the DB here to ensure the user still exists and
   * is not suspended/deleted (adds a DB hit per request — cache if needed).
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
