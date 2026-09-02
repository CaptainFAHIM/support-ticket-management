//mehrab
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getCustomerDashboard(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const [total, escalated] = await Promise.all([
      this.ticketsRepository.count({ where: { customer: { id: userId } } }),
      this.ticketsRepository.count({
        where: { customer: { id: userId }, isEscalated: true },
      }),
    ]);

    const statusRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.customer', 'customer')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('customer.id = :userId', { userId })
      .groupBy('ticket.status')
      .getRawMany();

    const priorityRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.customer', 'customer')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('customer.id = :userId', { userId })
      .groupBy('ticket.priority')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(TicketStatus)) {
      byStatus[status] = 0;
    }
    for (const row of statusRows) {
      byStatus[row.status] = Number(row.count);
    }

    const byPriority: Record<string, number> = {};
    for (const priority of Object.values(TicketPriority)) {
      byPriority[priority] = 0;
    }
    for (const row of priorityRows) {
      byPriority[row.priority] = Number(row.count);
    }

    const recentTickets = await this.ticketsRepository.find({
      where: { customer: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'title', 'status', 'priority', 'isEscalated', 'createdAt'],
    });

    const activeTickets =
      byStatus[TicketStatus.Open] + byStatus[TicketStatus.InProgress];

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        memberSince: user.createdAt,
      },
      ticketStats: {
        total,
        active: activeTickets,
        escalated,
        byStatus,
        byPriority,
      },
      recentTickets,
    };
  }
}