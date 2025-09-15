import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubaffiliatesQueryDto {
  @ApiProperty({ example: '2025-01-01', default: '2025-01-01' })
  @IsISO8601()
  @IsOptional()
  from?: string = '2025-01-01';

  @ApiProperty({ example: '2025-12-31', default: '2025-12-31' })
  @IsISO8601()
  @IsOptional()
  to?: string = '2025-12-31';

  @Transform(({ obj }: { obj: any }) => new Date(obj.from || '2025-01-01'), { toClassOnly: true })
  _fromDate?: Date;

  @Transform(({ obj }: { obj: any }) => new Date(obj.to || '2025-12-31'), { toClassOnly: true })
  _toDate?: Date;
}

export class SubaffiliateRowDto {
  @ApiProperty() subCode!: string;
  @ApiProperty({ required: false, nullable: true }) subName?: string | null;
  @ApiProperty() clicks!: number;
  @ApiProperty() conversions!: number;
  @ApiProperty() revenue!: number;
  @ApiProperty() epc!: number;
  @ApiProperty() ctr!: number;
  @ApiProperty() cvr!: number;
}
