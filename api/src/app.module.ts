import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';
import { IngestModule } from './ingest/ingest.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ReportsModule, PrismaModule, IngestModule, ScheduleModule.forRoot(), HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
