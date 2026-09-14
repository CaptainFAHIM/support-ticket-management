import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum TicketStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum TicketPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.Open })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.Medium })
  priority: TicketPriority;

  @Column({ type: 'boolean', default: false })
  isEscalated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt: Date | null;

  
  @Column({ type: 'smallint', nullable: true })
  rating: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ratingComment: string | null;

  @Column({ type: 'timestamp', nullable: true })
  ratedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  
  @ManyToOne('User', 'ownedTickets', { onDelete: 'CASCADE' })
@JoinColumn({ name: 'customerId' })
customer: any;

  @ManyToOne('User', 'assignedTickets', { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: any;

  @ManyToOne(() => Product, (product) => product.tickets, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product | null;

  @OneToMany('Comment', 'ticket')
  comments: any[];
}