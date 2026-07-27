import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

//Nadia
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
}

//Nadia