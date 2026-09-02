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
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Generate a basic ticket-count report' })
  @Roles(Role.Manager)
  @Get('reports/summary')
  async generateReport() {
    try {
      return await this.ticketsService.generateReport();
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Report generation failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: "Get the logged-in manager's ticket dashboard" })
  @Roles(Role.Manager)
  @Get('dashboard')
  async getDashboard(@Req() req) {
    try {
      return await this.ticketsService.getDashboard(req.user.sub);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Could not load dashboard' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Search tickets with sorting and pagination (Admin/Manager only)' })
  @ApiQuery({ name: 'status', required: false, example: 'Open' })
  @ApiQuery({ name: 'priority', required: false, example: 'High' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    example: 'createdAt',
    description: 'createdAt | updatedAt | priority | status',
  })
  @ApiQuery({ name: 'order', required: false, example: 'DESC' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Roles(Role.Admin, Role.Manager)
  @Get()
  async search(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    try {
      return await this.ticketsService.search(
        status,
        priority,
        sortBy,
        order,
        page,
        limit,
      );
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Search failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Get a ticket by id (Admin/Manager only)' })
  @Roles(Role.Admin, Role.Manager)
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

  @ApiOperation({ summary: 'Assign a ticket to another user' })
  @ApiBody({
    type: AssignTicketDto,
    examples: {
      default: {
        value: {
          assigneeId: 2,
        },
      },
    },
  })
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

  @ApiOperation({ summary: 'Manager accepts a ticket by self-assigning it' })
  @Roles(Role.Manager)
  @Patch(':id/accept')
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const result = await this.ticketsService.acceptTicket(id, user.sub);
      if (!result) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      return {
        ...result.ticket,
        action: result.wasReassigned ? 'reassigned' : 'accepted',
        previousAssigneeId: result.previousAssigneeId,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Accept failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Escalate a critical ticket to Urgent priority' })
  @Roles(Role.Manager)
  @Patch(':id/escalate')
  async escalate(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.ticketsService.escalateTicket(id);
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      return ticket;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Escalation failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Close a ticket' })
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
}
//Nadia