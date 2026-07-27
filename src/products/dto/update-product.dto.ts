import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'HelpDesk Enterprise', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;
}
