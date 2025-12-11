import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}