import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createReadStream, existsSync } from 'fs';
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
    constructor(private readonly prisma: PrismaService) { }

    @Cron('*/15 * * * *')
    async autoIngest() { await this.ingest(); }
    async ingest(filePath?: string) {
        // por defecto: ../data/drop/events.csv relativo a /api
        const defaultPath = path.resolve(process.cwd(), '../data/drop/events.csv');
        const fp = filePath ? path.resolve(filePath) : defaultPath;

        if (!existsSync(fp)) {
            throw new BadRequestException(
                `File not found: ${fp}. Provide ?file=... or place a CSV at ../data/drop/events.csv`
            );
        }
        const t0 = Date.now();
        let read = 0, clicks = 0, convs = 0, dedup = 0, errors = 0;

        // Para evitar cientos de promesas simultáneas, procesamos secuencialmente
        await new Promise<void>((resolve, reject) => {
            const stream = createReadStream(fp)
                .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
                .on('error', reject)
                .on('data', async (raw: any) => {
                    stream.pause(); // procesamos fila por fila
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
                            } catch (e: any) {
                                // viola @@unique([networkId, extConversionId]) -> duplicado
                                dedup++;
                            }
                        }
                    } catch {
                        errors++;
                    } finally {
                        stream.resume();
                    }
                })
                .on('end', () => resolve());
        });

        return {
            file: fp,
            read,
            clicks,
            conversions: convs,
            dedup,
            errors,
            seconds: Number(((Date.now() - t0) / 1000).toFixed(2)),
        };
    }
}
