//mehrab
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getProfile(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    await this.getProfile(userId);

    const changes: Partial<User> = {};
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.contactNumber !== undefined) changes.contactNumber = dto.contactNumber;

    if (Object.keys(changes).length === 0) {
      return await this.getProfile(userId);
    }

    await this.usersRepository.update(userId, changes);
    return await this.getProfile(userId);
  }
}