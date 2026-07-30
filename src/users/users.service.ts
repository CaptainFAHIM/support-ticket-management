import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';


//Nadia
@Injectable()
export class UsersService {
  constructor(
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>,

  @InjectRepository(Ticket)
  private readonly ticketRepository: Repository<Ticket>,
) {}

  async createUser(data: {
    email: string;
    password: string;
    role?: Role;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(id, { refreshToken });
  }

  async findByIdWithRefreshToken(id: number): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findByIdWithPassword(id: number): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }

  async updateProfile(
    id: number,
    dto: {
      email?: string;
      name?: string;
      contactNumber?: string;
      profilePicture?: string;
      address?: string;
    },
  ): Promise<User> {
    const user = await this.findById(id);

    const changes: Partial<User> = {};

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
      changes.email = dto.email;
    }

    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.contactNumber !== undefined) changes.contactNumber = dto.contactNumber;
    if (dto.profilePicture !== undefined) changes.profilePicture = dto.profilePicture;
    if (dto.address !== undefined) changes.address = dto.address;

    if (Object.keys(changes).length === 0) {
      return user;
    }

    await this.usersRepository.update(id, changes);
    return await this.findById(id);
  }

  async findCustomerById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id, role: Role.Customer },
    });
  }

  async findAllCustomers(): Promise<User[]> {
    return await this.usersRepository.find({ where: { role: Role.Customer } });
  }

  async updateCustomer(id: number, dto: { email?: string }): Promise<User | null> {
    const customer = await this.findCustomerById(id);
    if (!customer) return null;
    Object.assign(customer, dto);
    return await this.usersRepository.save(customer);
  }

  async removeCustomer(id: number): Promise<boolean> {
    const customer = await this.findCustomerById(id);
    if (!customer) return false;
    const result = await this.usersRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // ── Admin-only methods ──────────────────────────────────────────────────────
  // Fahim

  /**
   * List all users, optionally filtered by role.
   * Admin only.
   */
  async findAll(role?: Role): Promise<User[]> {
    const where = role ? { role } : {};
    return await this.usersRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find any user by ID (not restricted to a specific role).
   * Admin only.
   */
  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Change a user's role.
   * Admin only.
   */
  async updateUserRole(id: number, role: Role): Promise<User> {
    const user = await this.findUserById(id);
    user.role = role;
    return await this.usersRepository.save(user);
  }

  /**
   * Hard-delete any user by ID.
   * Admin only.
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.findUserById(id);
    await this.usersRepository.remove(user);
  }


//Nadia


//mehrab -dashboard ticket

async getCustomerDashboard(userId: number) {
  const totalTickets = await this.ticketRepository.count({
    where: {
      customer: {
        id: userId,
      },
    },
  });

  const openTickets = await this.ticketRepository.count({
    where: {
      customer: {
        id: userId,
      },
      status: TicketStatus.Open,
    },
  });

  const inProgressTickets = await this.ticketRepository.count({
    where: {
      customer: {
        id: userId,
      },
      status: TicketStatus.InProgress,
    },
  });

  const resolvedTickets = await this.ticketRepository.count({
    where: {
      customer: {
        id: userId,
      },
      status: TicketStatus.Resolved,
    },
  });

  const closedTickets = await this.ticketRepository.count({
    where: {
      customer: {
        id: userId,
      },
      status: TicketStatus.Closed,
    },
  });

  const recentTickets = await this.ticketRepository.find({
    where: {
      customer: {
        id: userId,
      },
    },
    order: {
      createdAt: 'DESC',
    },
    take: 5,
    relations: ['product'],
  });

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    recentTickets,
  };
}
}