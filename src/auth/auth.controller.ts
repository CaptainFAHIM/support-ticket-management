import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * AuthController
 *
 * Public endpoints — no JwtAuthGuard applied here.
 *
 * TODO:
 *  - POST /auth/register  → accepts RegisterDto, returns { accessToken }
 *  - POST /auth/login     → accepts LoginDto, returns { accessToken }
 *  - POST /auth/refresh   → accepts { refreshToken }, returns new accessToken
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Placeholder — full endpoints coming next
  // Example of what the login endpoint will look like:
  //
  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // async login(@Body() dto: LoginDto) {
  //   return this.authService.login(dto);
  // }
}
