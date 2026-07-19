//Nadia

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ApplyManagerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}