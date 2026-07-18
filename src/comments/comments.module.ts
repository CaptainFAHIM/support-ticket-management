import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

/**
 * CommentsModule
 *
 * Encapsulates the ticket-comment feature.
 * TicketsModule must be imported here (or CommentsService injected into
 * TicketsModule) when adding business logic to validate ticket ownership.
 *
 * TODO: Import TicketsModule to verify ticket existence and ownership.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
