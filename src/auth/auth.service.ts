import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

/**
 * AuthService
 *
 * Handles authentication concerns: validating credentials and issuing tokens.
 *
 * TODO:
 *  - register(dto)        → hash password with bcrypt, create User, return token
 *  - login(dto)           → validate credentials, return signed JWT
 *  - validateUser(email, pass) → called internally by local strategy (if added)
 *  - refreshToken(token)  → validate refresh token, issue new access token
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Signs and returns a JWT access token for the given user.
   * Called after successful registration or login.
   */
  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  // Placeholder — full register/login implementation coming next
}
