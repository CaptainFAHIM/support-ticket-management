import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator that attaches required role metadata to a route handler.
 * Used together with RolesGuard to enforce role-based access control.
 *
 * @example
 * @Roles(Role.Admin, Role.Manager)
 * @Get('admin-only')
 * getAdminData() {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
