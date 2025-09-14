import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SubaffiliateRowDto, SummaryQueryDto, SummaryResponseDto } from './dtos';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('summary')
    @ApiOkResponse({ type: SummaryResponseDto })
    async summary(@Query() q: SummaryQueryDto): Promise<SummaryResponseDto> {
        interface WhereClause {
            eventAt: { gte: Date; lte: Date };
            networkId?: number;
            subAffiliateId?: number;
        }

        const whereConv: WhereClause = { 
            eventAt: { 
                gte: q._fromDate ?? new Date(q.from), 
                lte: q._toDate ?? new Date(q.to) 
            } 
        };
        const whereClick: WhereClause = { 
            eventAt: { 
                gte: q._fromDate ?? new Date(q.from), 
                lte: q._toDate ?? new Date(q.to) 
            } 
        };

        if (q.network) {
            const n = await this.prisma.network.findFirst({ where: { name: q.network } });
            if (n) { 
                whereConv.networkId = n.id; 
                whereClick.networkId = n.id; 
            }
        }
        if (q.sub) {
            const s = await this.prisma.subAffiliate.findFirst({ where: { code: q.sub } });
            if (s) { 
                whereConv.subAffiliateId = s.id; 
                whereClick.subAffiliateId = s.id; 
            }
        }

        const [clicks, conversions, revenue] = await Promise.all([
            this.prisma.click.count({ where: whereClick }),
            this.prisma.conversion.count({ where: whereConv }),
            this.prisma.conversion.aggregate({ _sum: { amount: true }, where: whereConv }),
        ]);

        const ctr = clicks ? (conversions / clicks) : 0;
        const cvr = clicks ? (conversions / clicks) : 0;
        const payout = revenue._sum.amount ?? 0;

        return { 
            clicks, 
            conversions, 
            ctr, 
            cvr, 
            revenue: payout, 
            payout, 
            epc: clicks ? payout / clicks : 0 
        };
    }

    @Get('subaffiliates')
    @ApiOkResponse({ type: SubaffiliateRowDto, isArray: true })
    async bySub(
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        const start = new Date(from), end = new Date(to);

        // Agrupamos "a mano" (MVP) con dos queries y un merge en memoria
        const conv = await this.prisma.conversion.findMany({
            where: { eventAt: { gte: start, lte: end } },
            select: { subAffiliateId: true, amount: true },
        });
        const clicks = await this.prisma.click.findMany({
            where: { eventAt: { gte: start, lte: end } },
            select: { subAffiliateId: true },
        });

        interface SubAffiliateStats {
            clicks: number;
            conversions: number;
            revenue: number;
        }

        const map: Record<number, SubAffiliateStats> = {};
        for (const c of clicks) {
            map[c.subAffiliateId] ??= { clicks: 0, conversions: 0, revenue: 0 };
            map[c.subAffiliateId].clicks++;
        }
        for (const x of conv) {
            map[x.subAffiliateId] ??= { clicks: 0, conversions: 0, revenue: 0 };
            map[x.subAffiliateId].conversions++;
            map[x.subAffiliateId].revenue += x.amount || 0;
        }

        const subs = await this.prisma.subAffiliate.findMany({ 
            select: { id: true, code: true, name: true } 
        });
        
        return subs.map(s => {
            const m = map[s.id] ?? { clicks: 0, conversions: 0, revenue: 0 };
            const ctr = m.clicks ? m.conversions / m.clicks : 0;
            return { 
                subCode: s.code, 
                subName: s.name, 
                ...m, 
                epc: m.clicks ? m.revenue / m.clicks : 0, 
                ctr, 
                cvr: ctr 
            };
        });
    }
}
