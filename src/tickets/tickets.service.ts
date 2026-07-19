import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus} from './entities/ticket.entity';

/**
 * TicketsService
 *
 * Core business logic for support ticket management.
 *
 * TODO:
 *  - createTicket(dto, customerId)
 *  - findAll(filters)       → paginated, filter by status / priority / product
 *  - findOne(id)
 *  - assignTicket(id, assigneeId)
 *  - updateStatus(id, status)
 *  - updatePriority(id, priority)
 *  - deleteTicket(id)       → soft-delete or Admin-only hard delete
 *
 * Access control notes:
 *  - Customers may only see/edit their own tickets.
 *  - Managers see tickets for products they manage (future feature).
 *  - Admins have unrestricted access.
 */
@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  //Nadia
async findOne(id: number): Promise<Ticket | null> {
  return await this.ticketsRepository.findOne({
    where: { id },
    relations: { customer: true, assignee: true },
  });
}
  async assign(ticketId: number, assigneeId: number): Promise<Ticket | null> {
    const ticket = await this.findOne(ticketId);
    if (!ticket) return null;
    ticket.assignee = { id: assigneeId } as any;
    ticket.status = TicketStatus.InProgress;
    return await this.ticketsRepository.save(ticket);
  }
  async close(ticketId: number): Promise<Ticket | null> {
    const ticket = await this.findOne(ticketId);
    if (!ticket) return null;
    ticket.status = TicketStatus.Closed;
    return await this.ticketsRepository.save(ticket);
  }

  /**  flexible filtering. */
  async search(status?: string, priority?: string): Promise<Ticket[]> {
    const query = this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.assignee', 'assignee');

    if (status) query.andWhere('ticket.status = :status', { status });
    if (priority) query.andWhere('ticket.priority = :priority', { priority });

    return await query.getMany();
  }
}

//nADIA