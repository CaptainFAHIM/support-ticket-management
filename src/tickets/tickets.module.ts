import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

/**
 * TicketsModule
 *
 * Imports UsersModule and ProductsModule (not shown here) to validate
 * references when creating or updating tickets.
 *
 * TODO: Import ProductsModule and UsersModule when business logic is added.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
