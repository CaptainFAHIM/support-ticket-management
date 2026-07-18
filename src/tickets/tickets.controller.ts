import { Controller } from '@nestjs/common';
import { TicketsService } from './tickets.service';

/**
 * TicketsController
 *
 * Handles all ticket lifecycle operations.
 *
 * TODO:
 *  - POST   /tickets              → create ticket          (Customer)
 *  - GET    /tickets              → list tickets           (Admin, Manager: all | Customer: own)
 *  - GET    /tickets/:id          → get ticket details     (owner or Admin/Manager)
 *  - PATCH  /tickets/:id          → update status/priority (Admin, Manager)
 *  - PATCH  /tickets/:id/assign   → assign to agent        (Admin, Manager)
 *  - DELETE /tickets/:id          → delete ticket          (Admin only)
 */
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Endpoints to be implemented
}
