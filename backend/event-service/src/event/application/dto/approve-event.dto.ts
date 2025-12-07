import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class ApproveEventDto {
    @IsString()
    @IsOptional()
    @MinLength(10)
    @MaxLength(500)
    note?: string;
}

export class RejectEventDto {
    @IsString()
    @MinLength(10)
    @MaxLength(500)
    rejectionReason: string;
}

export class CancelEventDto {
    @IsString()
    @MinLength(10)
    @MaxLength(500)
    cancellationReason: string;
}