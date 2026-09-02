//Nadia

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly mailerService: MailerService,
  ) {}
  

  async findOne(id: number): Promise<Ticket | null> {
    return await this.ticketsRepository.findOne({
      where: { id },
      relations: { customer: true, assignee: true },
    });
  }

async close(ticketId: number): Promise<Ticket | null> {
  const ticket = await this.findOne(ticketId);
  if (!ticket) return null;
  ticket.status = TicketStatus.Closed;
  const saved = await this.ticketsRepository.save(ticket);

    if (saved.customer?.email) {
      await this.mailerService.sendMail({
        to: saved.customer.email,
        subject: `Ticket #${saved.id} Resolved`,
        text: `Your ticket "${saved.title}" has been resolved and closed.`,
      });
  }
  return saved;
  }

 async assign(ticketId: number, assigneeId: number): Promise<{ ticket: any; wasReassigned: boolean; previousAssigneeId: number | null } | null> {

  const ticket = await this.findOne(ticketId);
  
  if (!ticket) return null;

  const previousAssigneeId = ticket.assignee?.id ?? null;
  const wasReassigned = previousAssigneeId !== null && previousAssigneeId !== assigneeId;

  
  ticket.assignee = { id: assigneeId } as any; 
  ticket.status = TicketStatus.InProgress;
  
  const saved = await this.ticketsRepository.save(ticket);

 
  if (saved.customer?.email) {
    await this.mailerService.sendMail({
      to: saved.customer.email,
      subject: `Ticket #${saved.id} Update`,
      text: `A support manager has been assigned to your ticket "${saved.title}".`,
    });
  }

  return { ticket: saved, wasReassigned, previousAssigneeId };
}


 
  private static readonly SORTABLE_COLUMNS = [
    'createdAt',
    'updatedAt',
    'priority',
    'status',
  ];

  
  async search(
    status?: string,
    priority?: string,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
    page = 1,
    limit = 10,
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? Math.min(limit, 100) : 10;
    const sortColumn = TicketsService.SORTABLE_COLUMNS.includes(sortBy ?? '')
      ? sortBy!
      : 'createdAt';

    const [data, total] = await this.ticketsRepository.findAndCount({
      where: {
        ...(status && { status: status as TicketStatus }),
        ...(priority && { priority: priority as TicketPriority }),
      },
      relations: { customer: true, assignee: true },
      order: { [sortColumn]: order === 'ASC' ? 'ASC' : 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  
  async escalateTicket(ticketId: number): Promise<Ticket | null> {
  const ticket = await this.findOne(ticketId);
  if (!ticket) return null;

  ticket.priority = TicketPriority.Urgent;
  ticket.isEscalated = true;
  ticket.escalatedAt = new Date();
  const saved = await this.ticketsRepository.save(ticket);

  if (saved.customer?.email) {
    await this.mailerService.sendMail({
      to: saved.customer.email,
      subject: `Ticket #${saved.id} Escalated`,
      text: `Your ticket "${saved.title}" has been marked as urgent and is being prioritized.`,
    });
  }

  return saved;
}
  
  async acceptTicket(
    ticketId: number,
    managerId: number,
  ): Promise<{ ticket: Ticket; wasReassigned: boolean; previousAssigneeId: number | null } | null> {
    return await this.assign(ticketId, managerId);
  }

  
  async generateReport(): Promise<{
    totalTickets: number;
    escalatedCount: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const totalTickets = await this.ticketsRepository.count();
    const escalatedCount = await this.ticketsRepository.count({
      where: { isEscalated: true },
    });

    const statusRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    const priorityRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.priority')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const row of statusRows) {
      byStatus[row.status] = Number(row.count);
    }

    const byPriority: Record<string, number> = {};
    for (const row of priorityRows) {
      byPriority[row.priority] = Number(row.count);
    }

    return { totalTickets, escalatedCount, byStatus, byPriority };
  }

async getDashboard(managerId: number) {
  const myTickets = await this.ticketsRepository.find({
    where: { assignee: { id: managerId } } as any,
    relations: { customer: true },
  });

  const statusRows = await this.ticketsRepository
    .createQueryBuilder('ticket')
    .select('ticket.status', 'status')
    .addSelect('COUNT(ticket.id)', 'count')
    .where('ticket.assigneeId = :managerId', { managerId })
    .groupBy('ticket.status')
    .getRawMany();

  const byStatus: Record<string, number> = {};
  for (const row of statusRows) {
    byStatus[row.status] = Number(row.count);
  }

  return {
    totalAssigned: myTickets.length,
    byStatus,
    tickets: myTickets.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      customer: { id: (t.customer as any)?.id, email: (t.customer as any)?.email },
    })),
  };
}
}