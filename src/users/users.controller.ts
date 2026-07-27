import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateCustomerDto } from './dto/updateCustomer.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.Admin, Role.Manager)
  @Get('customers')
  async findAllCustomers() {
    try {
      return await this.usersService.findAllCustomers();
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Could not fetch customers' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('customers/:id')
  async findOneCustomer(@Param('id', ParseIntPipe) id: number) {
    try {
      const customer = await this.usersService.findCustomerById(id);
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.NOT_FOUND, error: error.message || 'Customer not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  
  @Roles(Role.Admin, Role.Manager)
  @Patch('customers/:id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    try {
      const customer = await this.usersService.updateCustomer(id, dto);
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  
  @Roles(Role.Admin, Role.Manager)
  @Delete('customers/:id')
  async removeCustomer(@Param('id', ParseIntPipe) id: number) {
    try {
      const deleted = await this.usersService.removeCustomer(id);
      if (!deleted) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Delete failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}