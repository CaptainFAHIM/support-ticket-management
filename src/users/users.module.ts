import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

/**
 * UsersModule
 *
 * Encapsulates everything related to User management.
 * UsersService is exported so AuthModule can use it for login/registration
 * without a circular dependency.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, Ticket])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
