//Nadia
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'customer@example.com', description: 'Email address for the new account' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password for the new account', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
//Nadia