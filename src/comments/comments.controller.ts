import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';

/**
 * CommentsController
 *
 * Nested under tickets — comments are always scoped to a ticket.
 *
 * TODO:
 *  - POST   /tickets/:ticketId/comments        → add comment  (authenticated)
 *  - GET    /tickets/:ticketId/comments        → list comments (authenticated)
 *  - PATCH  /tickets/:ticketId/comments/:id   → edit comment  (author or Admin)
 *  - DELETE /tickets/:ticketId/comments/:id   → delete comment (author or Admin)
 */
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Endpoints to be implemented
}
