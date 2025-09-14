import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ImpactConnector } from './impact/impact.connector';
import { CJConnector } from './cj/cj.connector';
import { ConnectorsService } from './connectors.service';

@Module({
  imports: [HttpModule],
  providers: [ImpactConnector, CJConnector, ConnectorsService],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
