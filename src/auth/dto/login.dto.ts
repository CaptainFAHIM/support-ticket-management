

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
//Nadia
export class LoginDto {
  @ApiProperty({ example: 'customer@example.com', description: 'Registered email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}