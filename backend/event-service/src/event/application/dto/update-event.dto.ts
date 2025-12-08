import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * UpdateEventDto
 * - Tất cả fields từ CreateEventDto đều optional
 * - Không cho phép update categoryId (phải qua admin)
 */
export class UpdateEventDto extends PartialType(
    OmitType(CreateEventDto, ['categoryId'] as const)
) {
    @IsBoolean()
    @IsOptional()
    featured?: boolean;
}