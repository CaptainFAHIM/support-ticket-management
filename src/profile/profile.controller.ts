//mehrab
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Get the logged-in user profile' })
  @Get()
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    try {
      return await this.profileService.getProfile(user.sub);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.NOT_FOUND, error: error.message || 'Profile not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @ApiOperation({ summary: 'Update name and contact number of the logged-in user' })
  @ApiBody({ type: UpdateProfileDto })
  @Patch()
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    try {
      return await this.profileService.updateProfile(user.sub, dto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Profile update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}