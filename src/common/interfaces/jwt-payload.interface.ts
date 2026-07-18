import { Role } from '../enums/role.enum';

/**
 * Shape of the JWT payload stored inside the signed token.
 * Kept minimal — only what is needed for authorization decisions.
 */
export interface JwtPayload {
  /** Database primary key of the authenticated user. */
  sub: number;

  /** User's email address (used as the human-readable identifier). */
  email: string;

  /** Role assigned to the user, used by RolesGuard. */
  role: Role;
}
