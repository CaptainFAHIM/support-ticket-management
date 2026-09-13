import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Between, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private static changePct(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  async getManagerDashboard(managerId: number) {
    const manager = await this.usersRepository.findOne({
      where: { id: managerId },
    });
    if (!manager) {
      throw new NotFoundException(`User with id ${managerId} not found`);
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalTickets,
      totalThisMonth,
      totalLastMonth,
      openTickets,
      openThisMonth,
      openLastMonth,
      resolvedTickets,
      resolvedThisMonth,
      resolvedLastMonth,
      inProgressTickets,
      inProgressThisMonth,
      inProgressLastMonth,
    ] = await Promise.all([
      this.ticketsRepository.count(),
      this.ticketsRepository.count({
        where: { createdAt: MoreThanOrEqual(startOfThisMonth) },
      }),
      this.ticketsRepository.count({
        where: { createdAt: Between(startOfLastMonth, startOfThisMonth) },
      }),
      this.ticketsRepository.count({ where: { status: TicketStatus.Open } }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.Open,
          createdAt: MoreThanOrEqual(startOfThisMonth),
        },
      }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.Open,
          createdAt: Between(startOfLastMonth, startOfThisMonth),
        },
      }),
      this.ticketsRepository.count({
        where: { status: TicketStatus.Resolved },
      }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.Resolved,
          updatedAt: MoreThanOrEqual(startOfThisMonth),
        },
      }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.Resolved,
          updatedAt: Between(startOfLastMonth, startOfThisMonth),
        },
      }),
      this.ticketsRepository.count({
        where: { status: TicketStatus.InProgress },
      }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.InProgress,
          updatedAt: MoreThanOrEqual(startOfThisMonth),
        },
      }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.InProgress,
          updatedAt: Between(startOfLastMonth, startOfThisMonth),
        },
      }),
    ]);

    const stats = {
      totalTickets: {
        value: totalTickets,
        changePct: DashboardService.changePct(totalThisMonth, totalLastMonth),
      },
      newTickets: {
        value: openTickets,
        changePct: DashboardService.changePct(openThisMonth, openLastMonth),
      },
      resolvedTickets: {
        value: resolvedTickets,
        changePct: DashboardService.changePct(
          resolvedThisMonth,
          resolvedLastMonth,
        ),
      },
      inProgressTickets: {
        value: inProgressTickets,
        changePct: DashboardService.changePct(
          inProgressThisMonth,
          inProgressLastMonth,
        ),
      },
    };

    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + mondayOffset);

    const weekRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select("TO_CHAR(ticket.createdAt, 'Dy')", 'day')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('ticket.createdAt >= :monday', { monday })
      .groupBy("TO_CHAR(ticket.createdAt, 'Dy')")
      .getRawMany();

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const countsByDay: Record<string, number> = {};
    for (const row of weekRows) {
      countsByDay[row.day.trim()] = Number(row.count);
    }
    const ticketVolume = dayLabels.map((day) => ({
      day,
      count: countsByDay[day] ?? 0,
    }));

    const statusRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(TicketStatus)) {
      byStatus[status] = 0;
    }
    for (const row of statusRows) {
      byStatus[row.status] = Number(row.count);
    }

    const ticketStatusBreakdown = [
      { status: 'New', count: byStatus[TicketStatus.Open] },
      { status: 'InProgress', count: byStatus[TicketStatus.InProgress] },
      { status: 'Resolved', count: byStatus[TicketStatus.Resolved] },
      { status: 'Closed', count: byStatus[TicketStatus.Closed] },
    ];

    const recentTicketsRaw = await this.ticketsRepository.find({
      relations: { customer: true, assignee: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const recentTickets = recentTicketsRaw.map((t) => ({
      id: t.id,
      title: t.title,
      customerName:
        (t.customer as any)?.name ?? (t.customer as any)?.email ?? 'Unknown',
      assigneeName:
        (t.assignee as any)?.name ?? (t.assignee as any)?.email ?? 'Unassigned',
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
    }));

    const totalCustomers = await this.usersRepository.count({
      where: { role: Role.Customer },
    });

    const teamMembersCount = await this.usersRepository.count({
      where: [{ role: Role.Manager }, { role: Role.Admin }],
    });

    const avgResponseRow = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select(
        'AVG(EXTRACT(EPOCH FROM (ticket.updatedAt - ticket.createdAt)))',
        'avgSeconds',
      )
      .where('ticket.status != :open', { open: TicketStatus.Open })
      .getRawOne();

    const avgResponseSeconds = avgResponseRow?.avgSeconds
      ? Number(avgResponseRow.avgSeconds)
      : null;
    const avgResponseTimeMinutes =
      avgResponseSeconds !== null ? Math.round(avgResponseSeconds / 60) : null;

    const overallRatingRow = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('AVG(ticket.rating)', 'avgRating')
      .addSelect('COUNT(ticket.rating)', 'ratedCount')
      .where('ticket.rating IS NOT NULL')
      .getRawOne();

    const overallAvgRating = overallRatingRow?.avgRating
      ? Math.round(Number(overallRatingRow.avgRating) * 10) / 10
      : null;
    const ratedTicketsCount = Number(overallRatingRow?.ratedCount ?? 0);

    const sixMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
    );
    const monthlyRatingRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select("TO_CHAR(ticket.ratedAt, 'Mon')", 'month')
      .addSelect("TO_CHAR(ticket.ratedAt, 'YYYY-MM')", 'monthKey')
      .addSelect('AVG(ticket.rating)', 'avgRating')
      .where('ticket.rating IS NOT NULL')
      .andWhere('ticket.ratedAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("TO_CHAR(ticket.ratedAt, 'Mon')")
      .addGroupBy("TO_CHAR(ticket.ratedAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(ticket.ratedAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const monthlyRatingByKey: Record<string, number> = {};
    for (const row of monthlyRatingRows) {
      monthlyRatingByKey[row.monthKey] =
        Math.round(Number(row.avgRating) * 10) / 10;
    }
    const satisfactionTrend: Array<{ month: string; avgRating: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      satisfactionTrend.push({
        month: monthLabel,
        avgRating: monthlyRatingByKey[key] ?? 0,
      });
    }

    const customerSatisfaction = {
      overallAvgRating,
      ratedTicketsCount,
      trend: satisfactionTrend,
    };

    return {
      profile: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
      },
      stats,
      ticketVolume,
      ticketStatusBreakdown,
      recentTickets,
      teamMembersCount,
      totalCustomers,
      avgResponseTimeMinutes,
      customerSatisfaction,
    };
  }

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

  async getAnalytics() {
    const now = new Date();

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const createdRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select("TO_CHAR(ticket.createdAt, 'YYYY-MM')", 'monthKey')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('ticket.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("TO_CHAR(ticket.createdAt, 'YYYY-MM')")
      .getRawMany();

    const resolvedRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select("TO_CHAR(ticket.updatedAt, 'YYYY-MM')", 'monthKey')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('ticket.status = :resolved', { resolved: TicketStatus.Resolved })
      .andWhere('ticket.updatedAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("TO_CHAR(ticket.updatedAt, 'YYYY-MM')")
      .getRawMany();

    const createdByMonth: Record<string, number> = {};
    for (const row of createdRows) createdByMonth[row.monthKey] = Number(row.count);
    const resolvedByMonth: Record<string, number> = {};
    for (const row of resolvedRows) resolvedByMonth[row.monthKey] = Number(row.count);

    const monthlyTrend: Array<{ month: string; created: number; resolved: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend.push({
        month: d.toLocaleString('en-US', { month: 'short' }),
        created: createdByMonth[key] ?? 0,
        resolved: resolvedByMonth[key] ?? 0,
      });
    }

    const matrixRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.priority')
      .addGroupBy('ticket.status')
      .getRawMany();

    const priorityStatusMatrix: Record<string, Record<string, number>> = {};
    for (const priority of Object.values(TicketPriority)) {
      priorityStatusMatrix[priority] = {};
      for (const status of Object.values(TicketStatus)) {
        priorityStatusMatrix[priority][status] = 0;
      }
    }
    for (const row of matrixRows) {
      priorityStatusMatrix[row.priority][row.status] = Number(row.count);
    }

    const totalTickets = await this.ticketsRepository.count();

    const prioritySummary = Object.values(TicketPriority).map((priority) => {
      const count = Object.values(priorityStatusMatrix[priority]).reduce(
        (sum, n) => sum + n,
        0,
      );
      return {
        priority,
        count,
        percentage:
          totalTickets > 0 ? Math.round((count / totalTickets) * 1000) / 10 : 0,
      };
    });

    const statusSummary = Object.values(TicketStatus).map((status) => {
      const count = Object.values(TicketPriority).reduce(
        (sum, priority) => sum + priorityStatusMatrix[priority][status],
        0,
      );
      return {
        status,
        count,
        percentage:
          totalTickets > 0 ? Math.round((count / totalTickets) * 1000) / 10 : 0,
      };
    });

    return {
      monthlyTrend,
      priorityStatusMatrix,
      prioritySummary,
      statusSummary,
      totalTickets,
    };
  }
}