import { IsString, IsNotEmpty, IsArray, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsOptional()
  authorAvatar?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsOptional()
  authorAvatar?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class GetPostsQueryDto {
  @IsString()
  @IsOptional()
  sortBy?: 'latest' | 'most_active';

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  skip?: string;
}