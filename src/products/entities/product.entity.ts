import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * Product entity.
 *
 * Represents a SaaS product for which support tickets can be raised.
 * Products can be deactivated (isActive = false) without being deleted so
 * that historical ticket data remains queryable.
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

  /** Soft-toggle: inactive products cannot receive new tickets. */
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ─────────────────────────────────────────────────────────────

  @OneToMany('Ticket', 'product')
  tickets: any[];
}
