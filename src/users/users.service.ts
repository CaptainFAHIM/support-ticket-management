import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * UsersService
 *
 * Responsible for CRUD operations on User records.
 * Password hashing is handled here (via bcrypt) before persisting.
 *
 * TODO:
 *  - Implement createUser(), findByEmail(), findById(), updateUser()
 *  - Add pagination support for admin list endpoints
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Placeholder — full implementation coming next
}
