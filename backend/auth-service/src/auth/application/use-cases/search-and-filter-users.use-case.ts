// import { Injectable, Inject } from '@nestjs/common';
// import { AUTH_REPOSITORY} from '../../domain/repositories/auth.repository.interface';
// import type { IAuthRepository} from '../../domain/repositories/auth.repository.interface';
// import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
// import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
// import { Auth } from '../../domain/entities/auth.entity';
// import { SearchUserDto } from '../dto/search-user.dto';

// export interface SearchUserResult {
//     users: Auth[];
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//     hasNextPage: boolean;
//     hasPreviousPage: boolean;
// }

// @Injectable()
// export class SearchAndFilterUsersUseCase {
//     constructor(
//         @Inject(AUTH_REPOSITORY) 
//         private readonly authRepository: IAuthRepository,
//         @Inject(ROLE_REPOSITORY)
//         private readonly roleRepository: IRoleRepository,
//     ) { }

//     async execute(filters: SearchUserDto): Promise<SearchUserResult> {
//         let roleId: string | undefined;
//         if (filters.role) {
//             const role = await this.roleRepository.findByName(filters.role);
//             roleId = role?.id;
            
//             if (!roleId) {
//                 return this.emptyResult(filters.page || 1, filters.limit || 20);
//             }
//         }

//         const queryFilters = {
//             keyword: filters.keyword,
//             roleId,
//             isLocked: filters.isLocked,
//             createdFrom: filters.createdFrom ? new Date(filters.createdFrom) : undefined,
//             createdTo: filters.createdTo ? new Date(filters.createdTo) : undefined,
//             lastLoginFrom: filters.lastLoginFrom ? new Date(filters.lastLoginFrom) : undefined,
//             lastLoginTo: filters.lastLoginTo ? new Date(filters.lastLoginTo) : undefined,
//             inactiveDays: filters.inactiveDays,
//             sortBy: filters.sortBy || 'createdAt',
//             sortOrder: filters.sortOrder || 'desc',
//             page: filters.page || 1,
//             limit: filters.limit || 20,
//         };

//         const { users, total } = await this.authRepository.searchWithFilters(queryFilters);

//         const totalPages = Math.ceil(total / queryFilters.limit);

//         return {
//             users,
//             total,
//             page: queryFilters.page,
//             limit: queryFilters.limit,
//             totalPages,
//             hasNextPage: queryFilters.page < totalPages,
//             hasPreviousPage: queryFilters.page > 1,
//         };
//     }

//     private emptyResult(page: number, limit: number): SearchUserResult {
//         return {
//             users: [],
//             total: 0,
//             page,
//             limit,
//             totalPages: 0,
//             hasNextPage: false,
//             hasPreviousPage: false,
//         };
//     }
// }