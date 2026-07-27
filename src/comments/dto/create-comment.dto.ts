import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Can you please provide more details about the error?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
