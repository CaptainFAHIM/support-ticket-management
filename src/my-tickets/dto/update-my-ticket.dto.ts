//mehrab
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { TicketPriority } from '../../tickets/entities/ticket.entity';

export class UpdateMyTicketDto {
  @ApiPropertyOptional({ example: 'Cannot log in on mobile app (updated)' })
  @IsOptional()
  @IsString()
  @Length(5, 150)
  title?: string;

  @ApiPropertyOptional({ example: 'Adding more detail about the crash.' })
  @IsOptional()
  @IsString()
  @Length(10, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number;
}