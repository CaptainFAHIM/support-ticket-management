//Nadia
import {
  Body,
  Controller,
  HttpCode,
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
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  /** Exchanges a valid refresh token for a new access + refresh token pair. */
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

  @Roles(Role.Admin)
  @Post('approve-manager/:userId')
  async approveManager(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.approveManager(userId);
  }
}
//Nadia