import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { AssistantQueryDto } from './dto/assistant-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Assistant')
@ApiBearerAuth()
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @ApiOperation({
    summary:
      'Support AI Assistant — rule-based answers for fixed prompts (today\'s summary, pending tickets, team performance, weekly report, high priority tickets)',
  })
  @Roles(Role.Manager, Role.Admin)
  @Post('query')
  async query(@Body() dto: AssistantQueryDto) {
    try {
      return await this.assistantService.handleQuery(dto.message);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not process assistant query',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}