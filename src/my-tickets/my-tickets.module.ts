//mehrab
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Product } from '../products/entities/product.entity';
import { MyTicketsService } from './my-tickets.service';
import { MyTicketsController } from './my-tickets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Product])],
  providers: [MyTicketsService],
  controllers: [MyTicketsController],
  exports: [MyTicketsService],
})
export class MyTicketsModule {}