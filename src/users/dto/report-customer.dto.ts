import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportCustomerDto {
  @ApiProperty({ example: 'Opened 6 tickets in 20 minutes, all with the same title.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}