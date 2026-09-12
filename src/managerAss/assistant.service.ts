import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

type AssistantIntent =
  | 'today_summary'
  | 'pending_tickets'
  | 'team_performance'
  | 'weekly_report'
  | 'high_priority'
  | 'unknown';

@Injectable()
export class AssistantService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}


  private matchIntent(message: string): AssistantIntent {
    const text = message.toLowerCase();

    if (text.includes('today')) return 'today_summary';
    if (text.includes('pending')) return 'pending_tickets';
    if (text.includes('team') && text.includes('performance'))
      return 'team_performance';
    if (text.includes('week') || text.includes('report')) return 'weekly_report';
    if (
      text.includes('high priority') ||
      text.includes('urgent') ||
      text.includes('priority')
    )
      return 'high_priority';

    return 'unknown';
  }

  async handleQuery(message: string) {
    const intent = this.matchIntent(message);

    switch (intent) {
      case 'today_summary':
        return this.getTodaySummary();
      case 'pending_tickets':
        return this.getPendingTickets();
      case 'team_performance':
        return this.getTeamPerformance();
      case 'weekly_report':
        return this.getWeeklyReport();
      case 'high_priority':
        return this.getHighPriorityTickets();
      default:
        return {
          intent: 'unknown',
          reply:
            "I couldn't match that to something I can look up yet. Try one of the suggested prompts, like \"Show today's ticket summary\" or \"Which tickets are pending?\"",
        };
    }
  }

  // ── 1. Today's ticket summary ──────────────────────────────────────────────
  private async getTodaySummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [createdToday, resolvedToday, stillOpenToday] = await Promise.all([
      this.ticketsRepository.count({
        where: { createdAt: this.gte(startOfToday) },
      }),
      this.ticketsRepository.count({
        where: {
          status: TicketStatus.Resolved,
          updatedAt: this.gte(startOfToday),
        },
      }),
      this.ticketsRepository.count({
        where: { status: TicketStatus.Open },
      }),
    ]);

    return {
      intent: 'today_summary',
      reply: `Today: ${createdToday} new ticket(s) came in, ${resolvedToday} were resolved. ${stillOpenToday} ticket(s) are still sitting in "Open".`,
      data: { createdToday, resolvedToday, stillOpenToday },
    };
  }

  // ── 2. Pending tickets (Open + InProgress) ────────────────────────────────
  private async getPendingTickets() {
    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where: [
        { status: TicketStatus.Open },
        { status: TicketStatus.InProgress },
      ],
      relations: { customer: true, assignee: true },
      order: { createdAt: 'ASC' },
      take: 10,
    });

    const list = tickets.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      customerName: (t.customer as any)?.name ?? (t.customer as any)?.email,
      assigneeName: (t.assignee as any)?.name ?? (t.assignee as any)?.email ?? 'Unassigned',
      createdAt: t.createdAt,
    }));

    return {
      intent: 'pending_tickets',
      reply: `There are ${total} pending ticket(s) (Open + In Progress). Showing the oldest ${list.length}.`,
      data: { total, tickets: list },
    };
  }

  // ── 3. Team performance ────────────────────────────────────────────────────
  private async getTeamPerformance() {
    const staff = await this.usersRepository.find({
      where: [{ role: Role.Manager }, { role: Role.Admin }],
    });

    const performance = await Promise.all(
      staff.map(async (member) => {
        const [assigned, resolved, inProgress] = await Promise.all([
          this.ticketsRepository.count({
            where: { assignee: { id: member.id } },
          }),
          this.ticketsRepository.count({
            where: { assignee: { id: member.id }, status: TicketStatus.Resolved },
          }),
          this.ticketsRepository.count({
            where: { assignee: { id: member.id }, status: TicketStatus.InProgress },
          }),
        ]);

        return {
          id: member.id,
          name: member.name ?? member.email,
          role: member.role,
          assigned,
          resolved,
          inProgress,
        };
      }),
    );

    // Sort by most resolved first — a simple, honest proxy for "top performer"
    performance.sort((a, b) => b.resolved - a.resolved);

    return {
      intent: 'team_performance',
      reply: `Team performance across ${performance.length} staff member(s), ranked by tickets resolved.`,
      data: { team: performance },
    };
  }

  // ── 4. Weekly report ────────────────────────────────────────────────────────
  private async getWeeklyReport() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + mondayOffset);

    const [createdThisWeek, resolvedThisWeek] = await Promise.all([
      this.ticketsRepository.count({
        where: { createdAt: this.gte(monday) },
      }),
      this.ticketsRepository.count({
        where: { status: TicketStatus.Resolved, updatedAt: this.gte(monday) },
      }),
    ]);

    const priorityRows = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('ticket.createdAt >= :monday', { monday })
      .groupBy('ticket.priority')
      .getRawMany();

    const byPriority: Record<string, number> = {};
    for (const priority of Object.values(TicketPriority)) {
      byPriority[priority] = 0;
    }
    for (const row of priorityRows) {
      byPriority[row.priority] = Number(row.count);
    }

    return {
      intent: 'weekly_report',
      reply: `This week so far: ${createdThisWeek} ticket(s) created, ${resolvedThisWeek} resolved.`,
      data: { createdThisWeek, resolvedThisWeek, byPriority, weekStart: monday },
    };
  }

  // ── 5. High priority tickets ────────────────────────────────────────────────
  private async getHighPriorityTickets() {
    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where: [
        { priority: TicketPriority.High, status: TicketStatus.Open },
        { priority: TicketPriority.High, status: TicketStatus.InProgress },
        { priority: TicketPriority.Urgent, status: TicketStatus.Open },
        { priority: TicketPriority.Urgent, status: TicketStatus.InProgress },
      ],
      relations: { customer: true, assignee: true },
      order: { createdAt: 'ASC' },
      take: 10,
    });

    const list = tickets.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      customerName: (t.customer as any)?.name ?? (t.customer as any)?.email,
      assigneeName: (t.assignee as any)?.name ?? (t.assignee as any)?.email ?? 'Unassigned',
      createdAt: t.createdAt,
    }));

    return {
      intent: 'high_priority',
      reply: `${total} High/Urgent ticket(s) are still unresolved. Showing the oldest ${list.length}.`,
      data: { total, tickets: list },
    };
  }

  private gte(date: Date) {

    return MoreThanOrEqual(date);
  }
}