import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [PrismaModule, ConnectorsModule],
  providers: [IngestService],
  controllers: [IngestController]
})
export class IngestModule {}
