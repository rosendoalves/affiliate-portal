import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [IngestService, PrismaService],
  controllers: [IngestController]
})
export class IngestModule {}
