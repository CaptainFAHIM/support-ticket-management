

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
//Nadia
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}