import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Ticket entity — the core domain object.
 *
 * A Ticket is always linked to a Product and a Customer (User with role=Customer).
 * An Assignee (User with role=Manager or Admin) is optional at creation time
 * and set when the ticket is picked up for triage.
 *
 * Relations:
 *  - product:  The product this ticket is filed against.
 *  - customer: The User who raised the ticket.
 *  - assignee: The support agent currently responsible for the ticket.
 *  - comments: Thread of comments on this ticket.
 */
@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.Open,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.Medium,
  })
  priority: TicketPriority;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ─────────────────────────────────────────────────────────────

  /** Product this ticket belongs to. */
  @ManyToOne(() => Product, (product) => product.tickets, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /** Customer who opened the ticket. */
  @ManyToOne(() => User, (user) => user.ownedTickets, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  /**
   * Support agent assigned to resolve the ticket.
   * Nullable — a ticket starts unassigned and is picked up during triage.
   */
  @ManyToOne(() => User, (user) => user.assignedTickets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User | null;

  /** Thread of comments on this ticket. */
  @OneToMany('Comment', 'ticket')
  comments: any[];
}
