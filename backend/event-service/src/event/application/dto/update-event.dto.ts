import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(
    OmitType(CreateEventDto, ['categoryId'] as const)
) {
    @IsBoolean()
    @IsOptional()
    featured?: boolean;
}