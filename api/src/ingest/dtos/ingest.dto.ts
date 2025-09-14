import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class IngestRunQueryDto {
  @ApiProperty({
    required: false,
    description: 'Ruta del CSV (abs o relativa a /api). Por defecto: ../data/drop/events.csv',
  })
  @IsOptional()
  @IsString()
  file?: string;
}

export class IngestRunResponseDto {
  @ApiProperty() file!: string;
  @ApiProperty() read!: number;
  @ApiProperty() clicks!: number;
  @ApiProperty() conversions!: number;
  @ApiProperty() dedup!: number;
  @ApiProperty() errors!: number;
  @ApiProperty() seconds!: number;
}
