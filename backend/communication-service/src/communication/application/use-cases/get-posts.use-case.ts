import { Injectable, Inject, Logger } from '@nestjs/common';
import { IPostRepository, PostSortBy } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';

@Injectable()
export class GetPostsUseCase {
  private readonly logger = new Logger(GetPostsUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(
    eventId: string,
    limit: number = 20,
    skip: number = 0,
    sortBy: PostSortBy = PostSortBy.LATEST,
  ): Promise<{ pinnedPosts: Post[]; posts: Post[]; total: number }> {
    this.logger.log(`Getting posts for event ${eventId}`);

    const [pinnedPosts, posts, total] = await Promise.all([
      this.postRepository.findPinnedByEventId(eventId),
      this.postRepository.findByEventId(eventId, limit, skip, sortBy),
      this.postRepository.getPostsCount(eventId),
    ]);

    this.logger.log(`✅ Found ${pinnedPosts.length} pinned and ${posts.length} regular posts`);

    return {
      pinnedPosts,
      posts,
      total,
    };
  }

  async getById(postId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }
}