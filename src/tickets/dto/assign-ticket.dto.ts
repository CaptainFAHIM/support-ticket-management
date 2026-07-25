import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
  @ApiProperty({ example: 2, description: 'ID of the user who should be assigned to the ticket' })
  @IsInt()
  @IsNotEmpty()
  assigneeId: number;
}