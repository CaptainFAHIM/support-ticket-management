
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({
    summary: 'Customer dashboard: profile summary, ticket statistics and recent tickets',
  })
  @Roles(Role.Customer)
  @Get('customer')
  async getCustomerDashboard(@CurrentUser() user: JwtPayload) {
    try {
      return await this.dashboardService.getCustomerDashboard(user.sub);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not load dashboard',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //Nadia
  @ApiOperation({
    summary:
      'Manager dashboard: ticket stats, weekly volume, status breakdown, recent tickets and team size',
  })
  @Roles(Role.Manager, Role.Admin)
  @Get('manager')
  async getManagerDashboard(@CurrentUser() user: JwtPayload) {
    try {
      return await this.dashboardService.getManagerDashboard(user.sub);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not load dashboard',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //Nadia
  @ApiOperation({
    summary:
      'Analytics page: monthly created/resolved trend (6 months) plus a priority × status deep dive',
  })
  @Roles(Role.Manager, Role.Admin)
  @Get('analytics')
  async getAnalytics() {
    try {
      return await this.dashboardService.getAnalytics();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not load analytics',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}