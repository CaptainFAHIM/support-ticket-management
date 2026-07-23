//Nadia

import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApplyManagerDto } from './dto/apply-manager.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}


  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  
 generateRefreshToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return this.jwtService.sign(payload, {
    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`,
  });
}

  
  private async issueTokens(user: User) {
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    try {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.usersService.createUser({
        email: dto.email,
        password: hashedPassword,
        role: Role.Customer,
      });

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Helpdesk',
        text: 'Your account has been created successfully.',
      });

      return this.issueTokens(user);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Registration failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.usersService.findByEmailWithPassword(dto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordMatches = await bcrypt.compare(dto.password, user.password);
      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.issueTokens(user);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.UNAUTHORIZED, error: error.message || 'Login failed' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

 
  async refreshTokens(userId: number, presentedRefreshToken: string) {
    try {
      const stored = await this.usersService.findByIdWithRefreshToken(userId);
      if (!stored?.refreshToken || stored.refreshToken !== presentedRefreshToken) {
        throw new ForbiddenException('Access denied');
      }

      return this.issueTokens(stored);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, error: error.message || 'Could not refresh token' },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async applyForManager(dto: ApplyManagerDto) {
    try {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const user = await this.usersService.createUser({
        email: dto.email,
        password: '',
        role: Role.Manager,
      });

      return {
        message: 'Application submitted. Awaiting admin approval.',
        userId: user.id,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Application failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async approveManager(userId: number) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.role !== Role.Manager) {
        throw new ForbiddenException('User is not a pending manager application');
      }

      const temporaryPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      await this.usersService.updatePassword(user.id, hashedPassword);

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Manager Application Approved',
        text: `Your temporary password is: ${temporaryPassword}. Please log in and change it.`,
      });

      return { message: 'Manager approved and notified by email' };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Approval failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
//Nadia