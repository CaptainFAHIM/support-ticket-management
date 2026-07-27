
//Nadia
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.ticketsService.findOne(id);
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      return ticket;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.NOT_FOUND, error: error.message || 'Ticket not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Roles(Role.Admin, Role.Manager)
@Patch(':id/assign')
async assign(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: AssignTicketDto,
) {
  try {
    const result = await this.ticketsService.assign(id, dto.assigneeId);
    if (!result) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }
    return {
      ...result.ticket,
      action: result.wasReassigned ? 'reassigned' : 'assigned',
      previousAssigneeId: result.previousAssigneeId,
    };
  } catch (error) {
    throw new HttpException(
      { status: HttpStatus.BAD_REQUEST, error: error.message || 'Assignment failed' },
      HttpStatus.BAD_REQUEST,
    );
  }
}

  @Roles(Role.Manager)
  @Patch(':id/close')
  async close(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.ticketsService.close(id);
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      return ticket;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not close ticket' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async search(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    try {
      return await this.ticketsService.search(status, priority);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Search failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
//Nadia