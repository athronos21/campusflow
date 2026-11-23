import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { AssistantQueryDto } from './dto/assistant-query.dto';

@ApiTags('Campus AI Assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('query')
  @ApiOperation({ summary: 'Process student question with real-time campus context' })
  @ApiResponse({ status: 200, description: 'Contextual AI response generated successfully' })
  async query(@Body() dto: AssistantQueryDto) {
    return this.assistantService.processQuery(dto);
  }
}
