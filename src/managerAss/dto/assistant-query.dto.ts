import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssistantQueryDto {
  @ApiProperty({
    example: "Show today's ticket summary",
    description:
      'Free-text question, or one of the suggested prompt labels shown in the UI.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}