import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  /**
   * Bcrypt-hashed password.
   */
  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Customer,
  })
  role: Role;

  /**
   * Stores the currently valid refresh token
   */
  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken: string | null;

//mehrab

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture: string | null;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Ticket', 'assignee')
  assignedTickets: any[];

  @OneToMany('Ticket', 'customer')
  ownedTickets: any[];

  @OneToMany('Comment', 'author')
  comments: any[];
}
//Nadia