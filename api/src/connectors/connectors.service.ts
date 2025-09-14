import { Injectable } from '@nestjs/common';
import { ImpactConnector } from './impact/impact.connector';
import { CJConnector } from './cj/cj.connector';

export interface AffiliateData {
  network: string;
  type: 'click' | 'conversion';
  subCode: string;
  campaign?: string;
  extId?: string;
  amount?: number;
  currency: string;
  eventAt: Date;
}

@Injectable()
export class ConnectorsService {
  constructor(
    private readonly impactConnector: ImpactConnector,
    private readonly cjConnector: CJConnector,
  ) {}

  async fetchDataFromAllNetworks(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    const results: AffiliateData[] = [];

    try {
      // Fetch from Impact
      const impactData = await this.impactConnector.fetchData(dateRange);
      results.push(...impactData);
    } catch (error) {
      console.error('Error fetching Impact data:', error);
    }

    try {
      // Fetch from CJ
      const cjData = await this.cjConnector.fetchData(dateRange);
      results.push(...cjData);
    } catch (error) {
      console.error('Error fetching CJ data:', error);
    }

    return results;
  }

  async fetchDataFromNetwork(network: string, dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    switch (network.toLowerCase()) {
      case 'impact':
        return this.impactConnector.fetchData(dateRange);
      case 'cj':
      case 'cjaffiliate':
        return this.cjConnector.fetchData(dateRange);
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }
}
