import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

/**
 * CommentsService
 *
 * Manages the comment thread on support tickets.
 *
 * TODO:
 *  - createComment(ticketId, authorId, dto)
 *  - findByTicket(ticketId)
 *  - updateComment(id, dto)  → author or Admin only
 *  - deleteComment(id)       → author or Admin only
 */
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  // Placeholder — full implementation coming next
}
