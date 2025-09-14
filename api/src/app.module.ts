import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';
import { IngestModule } from './ingest/ingest.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { ConnectorsModule } from './connectors/connectors.module';

@Module({
  imports: [ReportsModule, PrismaModule, IngestModule, ScheduleModule.forRoot(), HealthModule, ConnectorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
