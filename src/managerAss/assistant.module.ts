import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User])],
  providers: [AssistantService],
  controllers: [AssistantController],
})
export class AssistantModule {}