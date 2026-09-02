//mehrab
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MyTicketsService } from './my-tickets.service';
import { CreateMyTicketDto } from './dto/create-my-ticket.dto';
import { UpdateMyTicketDto } from './dto/update-my-ticket.dto';
import { QueryMyTicketsDto } from './dto/query-my-tickets.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('My Tickets (Customer)')
@ApiBearerAuth()
@Roles(Role.Customer)
@Controller('my/tickets')
export class MyTicketsController {
  constructor(private readonly myTicketsService: MyTicketsService) {}

  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiBody({ type: CreateMyTicketDto })
  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMyTicketDto,
  ) {
    try {
      return await this.myTicketsService.create(user.sub, dto);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not create ticket',
        },
        error.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'List my tickets with filtering and pagination' })
  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryMyTicketsDto,
  ) {
    try {
      return await this.myTicketsService.findAll(user.sub, query);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not fetch tickets',
        },
        error.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Get one of my tickets by id' })
  @Get(':id')
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      return await this.myTicketsService.findOne(user.sub, id);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.NOT_FOUND,
          error: error.message || 'Ticket not found',
        },
        error.status ?? HttpStatus.NOT_FOUND,
      );
    }
  }

  @ApiOperation({ summary: 'Update one of my Open tickets' })
  @ApiBody({ type: UpdateMyTicketDto })
  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMyTicketDto,
  ) {
    try {
      return await this.myTicketsService.update(user.sub, id, dto);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not update ticket',
        },
        error.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Delete one of my Open tickets' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      await this.myTicketsService.remove(user.sub, id);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not delete ticket',
        },
        error.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }
}