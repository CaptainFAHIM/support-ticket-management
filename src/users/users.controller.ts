import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * UsersController
 *
 * Exposes REST endpoints for user management (admin-only).
 *
 * TODO:
 *  - GET  /users        → list all users (Admin only)
 *  - GET  /users/:id    → get user by id (Admin or self)
 *  - PATCH /users/:id   → update user role / details (Admin only)
 *  - DELETE /users/:id  → soft-delete user (Admin only)
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoints to be implemented
}
