//mehrab
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../tickets/entities/ticket.entity';
import { Product } from '../products/entities/product.entity';
import { CreateMyTicketDto } from './dto/create-my-ticket.dto';
import { UpdateMyTicketDto } from './dto/update-my-ticket.dto';
import { QueryMyTicketsDto } from './dto/query-my-tickets.dto';

@Injectable()
export class MyTicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private async assertProductExists(productId?: number): Promise<void> {
    if (productId === undefined) return;
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new BadRequestException(`Product with id ${productId} does not exist`);
    }
  }

  private async findOwnedTicket(ticketId: number, userId: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId, customer: { id: userId } },
      relations: { product: true, assignee: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${ticketId} not found`);
    }
    return ticket;
  }

  async create(userId: number, dto: CreateMyTicketDto): Promise<Ticket> {
    await this.assertProductExists(dto.productId);

    const ticket = this.ticketsRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority ?? TicketPriority.Medium,
      status: TicketStatus.Open,
      isEscalated: false,
      customer: { id: userId } as any,
      product: dto.productId ? ({ id: dto.productId } as any) : null,
    });

    const saved = await this.ticketsRepository.save(ticket);
    return await this.findOwnedTicket(saved.id, userId);
  }

  async findAll(userId: number, query: QueryMyTicketsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await this.ticketsRepository.findAndCount({
      where: {
        customer: { id: userId },
        ...(query.status && { status: query.status }),
        ...(query.priority && { priority: query.priority }),
      },
      relations: { product: true, assignee: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: number, ticketId: number): Promise<Ticket> {
    return await this.findOwnedTicket(ticketId, userId);
  }

  async update(
    userId: number,
    ticketId: number,
    dto: UpdateMyTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.findOwnedTicket(ticketId, userId);

    if (ticket.status !== TicketStatus.Open) {
      throw new BadRequestException(
        `Ticket cannot be edited because its status is "${ticket.status}". Only Open tickets can be edited.`,
      );
    }

    await this.assertProductExists(dto.productId);

    if (dto.title !== undefined) ticket.title = dto.title;
    if (dto.description !== undefined) ticket.description = dto.description;
    if (dto.priority !== undefined) ticket.priority = dto.priority;
    if (dto.productId !== undefined) {
      ticket.product = { id: dto.productId } as any;
    }

    await this.ticketsRepository.save(ticket);
    return await this.findOwnedTicket(ticketId, userId);
  }

  async remove(userId: number, ticketId: number): Promise<void> {
    const ticket = await this.findOwnedTicket(ticketId, userId);

    if (ticket.status !== TicketStatus.Open) {
      throw new BadRequestException(
        `Ticket cannot be deleted because its status is "${ticket.status}". Only Open tickets can be deleted.`,
      );
    }

    await this.ticketsRepository.remove(ticket);
  }
}