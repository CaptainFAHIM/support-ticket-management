//mehrab
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { TicketPriority } from '../../tickets/entities/ticket.entity';

export class CreateMyTicketDto {
  @ApiProperty({ example: 'Cannot log in on mobile app' })
  @IsString()
  @Length(5, 150)
  title: string;

  @ApiProperty({ example: 'Every time I tap login the app closes itself.' })
  @IsString()
  @Length(10, 2000)
  description: string;

  @ApiPropertyOptional({ enum: TicketPriority, example: TicketPriority.High })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ example: 1, description: 'Product this ticket is about' })
  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number;
}