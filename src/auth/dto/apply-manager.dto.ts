//Nadia

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyManagerDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the applicant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'manager@example.com', description: 'Email address for the manager application' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}