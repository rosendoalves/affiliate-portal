import { Controller, Post, Query } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { IngestRunQueryDto, IngestRunResponseDto } from './dtos/ingest.dto';

@ApiTags('ingest')
@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) { }

  // POST /ingest/run?file=../data/drop/events.csv
  @Post('run')
  @ApiOkResponse({ type: IngestRunResponseDto })
  run(@Query() q: IngestRunQueryDto): Promise<IngestRunResponseDto> {
    return this.ingestService.ingest(q.file);
  }

  // POST /ingest/sync?days=7
  @Post('sync')
  @ApiOperation({ summary: 'Sync data from affiliate network APIs' })
  @ApiOkResponse({ description: 'Data synced successfully' })
  async sync(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.ingestService.syncFromAPIs(daysNumber);
  }
}
