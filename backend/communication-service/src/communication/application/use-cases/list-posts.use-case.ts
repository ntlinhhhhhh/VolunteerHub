import { Injectable, Inject } from '@nestjs/common';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { FilterPostDto } from '../dto/filter-post.dto';
import { PaginatedResult, IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';

@Injectable()
export class ListPostsUseCase {
    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository
    ) {}

    async execute(filterDto: FilterPostDto): Promise<PaginatedResult<Post>> {
        return await this.postRepository.findAll({
            eventId: filterDto.eventId,
            authorId: filterDto.authorId,
            isPinned: filterDto.isPinned,
            search: filterDto.search,
            page: filterDto.page || 1,
            limit: filterDto.limit || 20,
            sortBy: filterDto.sortBy || 'createdAt',
            sortOrder: filterDto.sortOrder || 'desc',
        });
    }
}