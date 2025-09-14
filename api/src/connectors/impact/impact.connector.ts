import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AffiliateData } from '../connectors.service';

@Injectable()
export class ImpactConnector {
  private readonly baseUrl = 'https://api.impact.com';
  private readonly apiKey = process.env.IMPACT_API_KEY;
  private readonly clientId = process.env.IMPACT_CLIENT_ID;

  constructor(private readonly httpService: HttpService) {}

  async fetchData(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    if (!this.apiKey || !this.clientId) {
      console.warn('Impact API credentials not configured');
      return this.getMockData(dateRange);
    }

    try {
      // Fetch clicks
      const clicks = await this.fetchClicks(dateRange);
      
      // Fetch conversions
      const conversions = await this.fetchConversions(dateRange);

      return [...clicks, ...conversions];
    } catch (error) {
      console.error('Error fetching Impact data:', error);
      return this.getMockData(dateRange);
    }
  }

  private async fetchClicks(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/Mediapartners/${this.clientId}/Clicks`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          startDate: dateRange.from.toISOString().split('T')[0],
          endDate: dateRange.to.toISOString().split('T')[0],
        },
      })
    );

    interface ClickData {
      affiliateId?: string;
      campaignName?: string;
      clickId?: string;
      clickDate: string;
    }

    return (response.data as ClickData[]).map((click) => ({
      network: 'impact',
      type: 'click' as const,
      subCode: click.affiliateId || 'UNKNOWN',
      campaign: click.campaignName,
      extId: click.clickId,
      currency: 'USD',
      eventAt: new Date(click.clickDate),
    }));
  }

  private async fetchConversions(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/Mediapartners/${this.clientId}/Conversions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          startDate: dateRange.from.toISOString().split('T')[0],
          endDate: dateRange.to.toISOString().split('T')[0],
        },
      })
    );

    interface ConversionData {
      affiliateId?: string;
      campaignName?: string;
      conversionId?: string;
      saleAmount?: number;
      currency?: string;
      conversionDate: string;
    }

    return (response.data as ConversionData[]).map((conversion) => ({
      network: 'impact',
      type: 'conversion' as const,
      subCode: conversion.affiliateId || 'UNKNOWN',
      campaign: conversion.campaignName,
      extId: conversion.conversionId,
      amount: conversion.saleAmount || 0,
      currency: conversion.currency || 'USD',
      eventAt: new Date(conversion.conversionDate),
    }));
  }

  private getMockData(dateRange: { from: Date; to: Date }): AffiliateData[] {
    // Mock data for development/testing
    const mockData: AffiliateData[] = [];
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(daysDiff * 5, 50); i++) {
      const eventDate = new Date(dateRange.from.getTime() + (i * 24 * 60 * 60 * 1000));
      
      mockData.push({
        network: 'impact',
        type: 'click',
        subCode: `SUB-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        campaign: 'summer-campaign',
        extId: `CLK-${1000 + i}`,
        currency: 'USD',
        eventAt: eventDate,
      });

      if (Math.random() > 0.7) {
        mockData.push({
          network: 'impact',
          type: 'conversion',
          subCode: `SUB-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
          campaign: 'summer-campaign',
          extId: `CNV-${2000 + i}`,
          amount: Math.random() * 100 + 10,
          currency: 'USD',
          eventAt: new Date(eventDate.getTime() + Math.random() * 60 * 60 * 1000),
        });
      }
    }

    return mockData;
  }
}
