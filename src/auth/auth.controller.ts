//Nadia
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApplyManagerDto } from './dto/apply-manager.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Get, Patch } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from 'src/users/users.service';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({
    type: RegisterDto,
    schema: {
      example: {
        email: 'customer@example.com',
        password: 'password123',
      },
    },
    examples: {
      default: {
        value: {
          email: 'customer@example.com',
          password: 'password123',
        },
      },
    },
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({
    type: LoginDto,
    schema: {
      example: {
        email: 'customer@example.com',
        password: 'password123',
      },
    },
    examples: {
      default: {
        value: {
          email: 'customer@example.com',
          password: 'password123',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  @ApiBody({
    type: RefreshTokenDto,
    schema: {
      example: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
    },
    examples: {
      default: {
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        },
      },
    },
  })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req, @Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(req.user.sub, dto.refreshToken);
  }

  @Public()
  @ApiOperation({ summary: 'Apply for manager access' })
  @ApiBody({
    type: ApplyManagerDto,
    schema: {
      example: {
        name: 'John Doe',
        email: 'manager@example.com',
      },
    },
    examples: {
      default: {
        value: {
          name: 'John Doe',
          email: 'manager@example.com',
        },
      },
    },
  })
  @Post('apply-manager')
  async applyForManager(@Body() dto: ApplyManagerDto) {
    return this.authService.applyForManager(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending manager application (Admin only)' })
  @Roles(Role.Admin)
  @Post('approve-manager/:userId')
  async approveManager(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.approveManager(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the logged-in user's profile" })
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the logged-in user's profile" })
  @ApiBody({
    type: UpdateProfileDto,
    schema: {
      example: {
        name: 'Nadia Sultana',
        contactNumber: '+8801712345678',
        profilePicture: 'https://example.com/photo.jpg',
        address: 'Dhaka, Bangladesh',
      },
    },
    examples: {
      default: {
        value: {
          name: 'Nadia Sultana',
          contactNumber: '+8801712345678',
          profilePicture: 'https://example.com/photo.jpg',
          address: 'Dhaka, Bangladesh',
        },
      },
    },
  })
  @Patch('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.sub, dto);
    return user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Change the logged-in user's password" })
  @ApiBody({
    type: ChangePasswordDto,
    schema: {
      example: {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
      },
    },
    examples: {
      default: {
        value: {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword456',
        },
      },
    },
  })
  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
//Nadia