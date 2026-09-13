import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: TicketStatus, example: TicketStatus.Resolved })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}