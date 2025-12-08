import { Injectable, Inject } from '@nestjs/common';
import {
    IRegistrationRepository,
    PaginatedResult,
} from '../../domain/repositories/registration.repository.interface';
import { Registration } from '../../domain/entities/registration.entity';
import { FilterRegistrationDto } from '../dto/filter-registration.dto';

@Injectable()
export class ListRegistrationsUseCase {
    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(filterDto: FilterRegistrationDto): Promise<PaginatedResult<Registration>> {
        const options = {
            eventId: filterDto.eventId,
            volunteerId: filterDto.volunteerId,
            organizerId: filterDto.organizerId,
            status: filterDto.status,
            roleId: filterDto.roleId,
            dateFrom: filterDto.dateFrom ? new Date(filterDto.dateFrom) : undefined,
            dateTo: filterDto.dateTo ? new Date(filterDto.dateTo) : undefined,
            page: filterDto.page || 1,
            limit: filterDto.limit || 20,
            sortBy: filterDto.sortBy || 'createdAt',
            sortOrder: filterDto.sortOrder || 'desc',
        };

        return await this.registrationRepository.findAll(options);
    }
}