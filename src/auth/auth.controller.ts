//Nadia
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApplyManagerDto } from './dto/apply-manager.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
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