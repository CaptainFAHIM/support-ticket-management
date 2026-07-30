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
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateCustomerDto } from './dto/updateCustomer.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Customer Dashboard',
  })
  //dashboard endpoint (mehrab)
  @Roles(Role.Customer)
  @Get('dashboard')
  async dashboard(@Req() req) {
    try {
      return await this.usersService.getCustomerDashboard(req.user.sub);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //nadia

  @ApiOperation({ summary: 'List all customers (Admin/Manager only)' })
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

  @ApiOperation({ summary: 'Get one customer by id (Admin/Manager only)' })
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

  @ApiOperation({ summary: 'Update a customer (Admin/Manager only)' })
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

  @ApiOperation({ summary: 'Delete a customer (Admin/Manager only)' })
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

  // ── Admin-only endpoints (Fahim) ───────────────────────────────────────────

  /**
   * List all users.
   * Optionally filter by role: GET /users?role=Manager
   */
  @ApiOperation({ summary: 'List all users, optionally filter by role (Admin only)' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter by role' })
  @Roles(Role.Admin)
  @Get()
  async findAll(@Query('role') role?: Role) {
    try {
      return await this.usersService.findAll(role);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Could not fetch users' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get any user by ID regardless of role.
   */
  @ApiOperation({ summary: 'Get any user by ID (Admin only)' })
  @Roles(Role.Admin)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.usersService.findUserById(id);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.NOT_FOUND, error: error.message || 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Change the role of any user.
   */
  @ApiOperation({ summary: "Change a user's role (Admin only)" })
  @Roles(Role.Admin)
  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    try {
      return await this.usersService.updateUserRole(id, dto.role);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not update role' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Hard-delete any user.
   */
  @ApiOperation({ summary: 'Hard-delete any user (Admin only)' })
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.usersService.deleteUser(id);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not delete user' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}