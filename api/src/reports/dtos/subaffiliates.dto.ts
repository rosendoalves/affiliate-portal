import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubaffiliatesQueryDto {
  @ApiProperty({ example: '2025-08-01' })
  @IsISO8601()
  from!: string;

  @ApiProperty({ example: '2025-08-31' })
  @IsISO8601()
  to!: string;

  @Transform(({ obj }: { obj: any }) => new Date(obj.from), { toClassOnly: true })
  _fromDate?: Date;

  @Transform(({ obj }: { obj: any }) => new Date(obj.to), { toClassOnly: true })
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
