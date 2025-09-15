import { Controller, Post, Query, Get } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { IngestRunQueryDto, IngestRunResponseDto } from './dtos/ingest.dto';

@ApiTags('ingest')
@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) { }

  @Post('run')
  @ApiOkResponse({ type: IngestRunResponseDto })
  run(@Query() q: IngestRunQueryDto): Promise<IngestRunResponseDto> {
    return this.ingestService.ingest(q.file);
  }


  @Get('history')
  @ApiOperation({ summary: 'Get processing history of files' })
  @ApiOkResponse({ description: 'Processing history retrieved successfully' })
  async getHistory() {
    return this.ingestService.getProcessingHistory();
  }
}
