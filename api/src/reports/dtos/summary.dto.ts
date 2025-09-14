import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SummaryQueryDto {
  @ApiProperty({ example: '2025-08-01' })
  @IsISO8601()
  from!: string;

  @ApiProperty({ example: '2025-08-31' })
  @IsISO8601()
  to!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sub?: string;

  // helpers opcionales: transformar a Date si querés usarlo directo
  @Transform(({ obj }: { obj: any }) => new Date(obj.from), { toClassOnly: true })
  _fromDate?: Date;

  @Transform(({ obj }: { obj: any }) => new Date(obj.to), { toClassOnly: true })
  _toDate?: Date;
}

export class SummaryResponseDto {
  @ApiProperty() clicks!: number;
  @ApiProperty() conversions!: number;
  @ApiProperty() ctr!: number;
  @ApiProperty() cvr!: number;
  @ApiProperty() revenue!: number;
  @ApiProperty() payout!: number;
  @ApiProperty() epc!: number;
}
