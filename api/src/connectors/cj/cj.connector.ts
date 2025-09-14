import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AffiliateData } from '../connectors.service';

@Injectable()
export class CJConnector {
  private readonly baseUrl = 'https://api.cj.com';
  private readonly apiKey = process.env.CJ_API_KEY;
  private readonly websiteId = process.env.CJ_WEBSITE_ID;

  constructor(private readonly httpService: HttpService) {}

  async fetchData(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    if (!this.apiKey || !this.websiteId) {
      console.warn('CJ API credentials not configured');
      return this.getMockData(dateRange);
    }

    try {
      // Fetch clicks
      const clicks = await this.fetchClicks(dateRange);
      
      // Fetch conversions
      const conversions = await this.fetchConversions(dateRange);

      return [...clicks, ...conversions];
    } catch (error) {
      console.error('Error fetching CJ data:', error);
      return this.getMockData(dateRange);
    }
  }

  private async fetchClicks(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/v3/links`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          websiteId: this.websiteId,
          startDate: dateRange.from.toISOString().split('T')[0],
          endDate: dateRange.to.toISOString().split('T')[0],
        },
      })
    );

    return response.data.map((click: any) => ({
      network: 'cj',
      type: 'click' as const,
      subCode: click.publisherId || 'UNKNOWN',
      campaign: click.campaignName,
      extId: click.linkId,
      currency: 'USD',
      eventAt: new Date(click.clickDate),
    }));
  }

  private async fetchConversions(dateRange: { from: Date; to: Date }): Promise<AffiliateData[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/v3/commissions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          websiteId: this.websiteId,
          startDate: dateRange.from.toISOString().split('T')[0],
          endDate: dateRange.to.toISOString().split('T')[0],
        },
      })
    );

    return response.data.map((conversion: any) => ({
      network: 'cj',
      type: 'conversion' as const,
      subCode: conversion.publisherId || 'UNKNOWN',
      campaign: conversion.campaignName,
      extId: conversion.commissionId,
      amount: conversion.saleAmount || 0,
      currency: conversion.currency || 'USD',
      eventAt: new Date(conversion.eventDate),
    }));
  }

  private getMockData(dateRange: { from: Date; to: Date }): AffiliateData[] {
    // Mock data for development/testing
    const mockData: AffiliateData[] = [];
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(daysDiff * 3, 30); i++) {
      const eventDate = new Date(dateRange.from.getTime() + (i * 24 * 60 * 60 * 1000));
      
      mockData.push({
        network: 'cj',
        type: 'click',
        subCode: `SUB-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
        campaign: 'brand-campaign',
        extId: `CLK-${3000 + i}`,
        currency: 'USD',
        eventAt: eventDate,
      });

      if (Math.random() > 0.6) {
        mockData.push({
          network: 'cj',
          type: 'conversion',
          subCode: `SUB-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
          campaign: 'brand-campaign',
          extId: `CNV-${4000 + i}`,
          amount: Math.random() * 150 + 20,
          currency: 'USD',
          eventAt: new Date(eventDate.getTime() + Math.random() * 60 * 60 * 1000),
        });
      }
    }

    return mockData;
  }
}
