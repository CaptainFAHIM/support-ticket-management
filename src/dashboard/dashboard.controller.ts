//mehrab
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
}