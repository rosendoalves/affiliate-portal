import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectorsService, AffiliateData } from '../connectors/connectors.service';
import { createReadStream, existsSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { parse } from 'fast-csv';
import { z } from 'zod';
import dayjs from 'dayjs';
import * as path from 'path';
import { Cron } from '@nestjs/schedule';

const Row = z.object({
    network: z.string(),
    type: z.enum(['click', 'conversion']),
    sub_code: z.string(),
    campaign: z.string().optional(),
    ext_id: z.string().optional().nullable(),
    amount: z.string().optional().nullable(),
    currency: z.string().optional().default('USD'),
    event_at: z.string(),
});

@Injectable()
export class IngestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly connectorsService: ConnectorsService,
    ) { }

    @Cron('*/15 * * * *')
    async autoIngest() { 
        try {
            await this.ingest(); 
        } catch (error: any) {
            console.log('Auto-ingest skipped:', error?.message || 'Unknown error');
        }
    }
    async ingest(filePath?: string) {
        const defaultPath = path.resolve(process.cwd(), '../data/drop/events.csv');
        const fp = filePath ? path.resolve(filePath) : defaultPath;

        if (!existsSync(fp)) {
            throw new BadRequestException(
                `File not found: ${fp}. Provide ?file=... or place a CSV at ../data/drop/events.csv`
            );
        }

        const fileHash = await this.getFileHash(fp);
        const existingFile = await this.prisma.processedFile.findUnique({
            where: { filePath: fp }
        });

        if (existingFile && existingFile.fileHash === fileHash) {
            console.log(`⏭️ File already processed: ${fp}`);
            return {
                file: fp,
                read: existingFile.recordsRead,
                clicks: existingFile.clicks,
                conversions: existingFile.conversions,
                dedup: existingFile.duplicates,
                errors: existingFile.errors,
                seconds: existingFile.processingTime,
                alreadyProcessed: true
            };
        }

        console.log(`🔄 Processing file: ${fp}`);
        const t0 = Date.now();
        let read = 0, clicks = 0, convs = 0, dedup = 0, errors = 0;

        await new Promise<void>((resolve, reject) => {
            const stream = createReadStream(fp)
                .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
                .on('error', reject)
                .on('data', async (raw: any) => {
                    stream.pause();
                    read++;
                    try {
                        const p = Row.parse(raw);
                        const [network, sub] = await Promise.all([
                            this.prisma.network.upsert({ where: { name: p.network }, update: {}, create: { name: p.network } }),
                            this.prisma.subAffiliate.upsert({ where: { code: p.sub_code }, update: {}, create: { code: p.sub_code } }),
                        ]);
                        const eventAt = dayjs(p.event_at).toDate();

                        if (p.type === 'click') {
                            await this.prisma.click.create({
                                data: {
                                    networkId: network.id,
                                    subAffiliateId: sub.id,
                                    extClickId: p.ext_id ?? null,
                                    campaign: p.campaign,
                                    eventAt,
                                },
                            });
                            clicks++;
                        } else {
                            try {
                                await this.prisma.conversion.create({
                                    data: {
                                        networkId: network.id,
                                        subAffiliateId: sub.id,
                                        extConversionId: p.ext_id ?? `${network.id}-${sub.id}-${read}`,
                                        campaign: p.campaign,
                                        amount: Number(p.amount ?? 0),
                                        currency: p.currency ?? 'USD',
                                        eventAt,
                                    },
                                });
                                convs++;
                            } catch {
                                dedup++;
                            }
                        }
                    } catch (error) {
                        console.error(`❌ Error processing row ${read}:`, error);
                        errors++;
                    } finally {
                        stream.resume();
                    }
                })
                .on('end', () => resolve());
        });

        const processingTime = Number(((Date.now() - t0) / 1000).toFixed(2));
        
        await this.prisma.processedFile.upsert({
            where: { filePath: fp },
            update: {
                fileHash,
                recordsRead: read,
                clicks,
                conversions: convs,
                duplicates: dedup,
                errors,
                processingTime,
                processedAt: new Date()
            },
            create: {
                filePath: fp,
                fileHash,
                recordsRead: read,
                clicks,
                conversions: convs,
                duplicates: dedup,
                errors,
                processingTime
            }
        });

        const result = {
            file: fp,
            read,
            clicks,
            conversions: convs,
            dedup,
            errors,
            seconds: processingTime,
        };

        console.log(`✅ Processing completed:`, result);
        return result;
    }

    async syncFromAPIs(days: number = 7) {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);

        const t0 = Date.now();
        let totalProcessed = 0;
        let errors = 0;

        try {
            // Fetch data from all networks
            const apiData = await this.connectorsService.fetchDataFromAllNetworks({ from, to });
            
            // Process each data point
            for (const data of apiData) {
                try {
                    await this.processAffiliateData(data);
                    totalProcessed++;
                } catch (error) {
                    console.error('Error processing affiliate data:', error);
                    errors++;
                }
            }

            return {
                from: from.toISOString(),
                to: to.toISOString(),
                totalProcessed,
                errors,
                seconds: Number(((Date.now() - t0) / 1000).toFixed(2)),
            };
        } catch (error) {
            console.error('Error syncing from APIs:', error);
            throw new BadRequestException('Failed to sync data from affiliate networks');
        }
    }

    private async processAffiliateData(data: AffiliateData) {
        // Ensure network and sub-affiliate exist
        const [network, subAffiliate] = await Promise.all([
            this.prisma.network.upsert({
                where: { name: data.network },
                update: {},
                create: { name: data.network },
            }),
            this.prisma.subAffiliate.upsert({
                where: { code: data.subCode },
                update: {},
                create: { code: data.subCode },
            }),
        ]);

        if (data.type === 'click') {
            await this.prisma.click.create({
                data: {
                    networkId: network.id,
                    subAffiliateId: subAffiliate.id,
                    extClickId: data.extId,
                    campaign: data.campaign,
                    eventAt: data.eventAt,
                },
            });
        } else {
            try {
                await this.prisma.conversion.create({
                    data: {
                        networkId: network.id,
                        subAffiliateId: subAffiliate.id,
                        extConversionId: data.extId || `${network.id}-${subAffiliate.id}-${Date.now()}`,
                        campaign: data.campaign,
                        amount: data.amount || 0,
                        currency: data.currency,
                        eventAt: data.eventAt,
                    },
                });
            } catch (error: any) {
                // Handle duplicate conversion error
                if (error.code === 'P2002') {
                    console.log('Duplicate conversion skipped:', data.extId);
                } else {
                    throw error;
                }
            }
        }
    }

    async getProcessingHistory() {
        return this.prisma.processedFile.findMany({
            orderBy: { processedAt: 'desc' },
            take: 50
        });
    }

    private async getFileHash(filePath: string): Promise<string> {
        const fileBuffer = readFileSync(filePath);
        const hashSum = createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
}
