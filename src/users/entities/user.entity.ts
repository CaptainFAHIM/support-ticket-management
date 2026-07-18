import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

/**
 * User entity.
 *
 * Represents a system user who may be an Admin, Manager, or Customer.
 * Passwords are stored as bcrypt hashes — never in plain text.
 *
 * Relations:
 *  - assignedTickets: Tickets where this user is the support agent (Assignee).
 *  - ownedTickets:    Tickets raised by this user (Customer).
 *  - comments:        Comments authored by this user.
 */
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  /**
   * Bcrypt-hashed password.
   * The `select: false` option prevents the hash from being returned in
   * normal queries — it must be explicitly selected when needed (e.g. login).
   */
  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Customer,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations (defined lazily to avoid circular imports) ─────────────────

  /** Tickets assigned to this user as a support agent. */
  @OneToMany('Ticket', 'assignee')
  assignedTickets: any[];

  /** Tickets created by this user (as a Customer). */
  @OneToMany('Ticket', 'customer')
  ownedTickets: any[];

  /** All comments written by this user. */
  @OneToMany('Comment', 'author')
  comments: any[];
}
