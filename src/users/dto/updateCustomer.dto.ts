import { IsEmail, IsOptional } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}