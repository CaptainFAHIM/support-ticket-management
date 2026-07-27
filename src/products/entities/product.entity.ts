import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';

/**
 * Product entity.
 *
 * Represents a SaaS product for which support tickets can be raised.
 *
 * Relations:
 *  - tickets: All tickets filed against this product.
 */
@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ─────────────────────────────────────────────────────────────

  @OneToMany(() => Ticket, (ticket) => ticket.product)
  tickets: Ticket[];
}
