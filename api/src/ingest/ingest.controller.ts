import { Controller, Post, Query } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
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
}
