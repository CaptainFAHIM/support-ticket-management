import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RateTicketDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Satisfaction rating, 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Quick and helpful response!',
    required: false,
    description: 'Optional short feedback comment',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}