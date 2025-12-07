import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from '../../application/dto/create-category.dto';
import { IEventCategoryRepository } from '../../domain/repositories/event-category.repository.interface';
import { Inject } from '@nestjs/common';
import { CreateCategoryUseCase } from 'src/event/application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from 'src/event/application/use-cases/list-categories.use-case';
import { Public } from '@share/auth/public.decorator';
import { Roles } from '@share/auth/roles.decorator';

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly listCategoriesUseCase: ListCategoriesUseCase,
        @Inject(IEventCategoryRepository)
        private readonly categoryRepository: IEventCategoryRepository
    ) { }

    /**
     * PUBLIC: List all categories
     * GET /api/categories
     */
    @Public()
    @Get()
    async listCategories(@Query('activeOnly') activeOnly?: string) {
        const active = activeOnly === 'false' ? false : true;
        const categories = await this.listCategoriesUseCase.execute(active);

        return {
            success: true,
            data: categories,
            total: categories.length,
        };
    }

    /**
     * PUBLIC: Get category by ID
     * GET /api/categories/:id
     */
    @Public()
    @Get(':id')
    async getCategoryById(@Param('id') id: string) {
        const category = await this.categoryRepository.findById(id);

        return {
            success: true,
            data: category,
        };
    }

    /**
     * ADMIN: Create category
     * POST /api/categories
     */
    @Post()
    @Roles('admin')
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        const category = await this.createCategoryUseCase.execute(createCategoryDto);

        return {
            success: true,
            message: 'Category created successfully',
            data: category,
        };
    }

    /**
     * ADMIN: Update category
     * PUT /api/categories/:id
     */
    @Put(':id')
    @Roles('admin')
    async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        const category = await this.categoryRepository.update(id, updateCategoryDto as any);

        return {
            success: true,
            message: 'Category updated successfully',
            data: category,
        };
    }

    /**
     * ADMIN: Delete category
     * DELETE /api/categories/:id
     */
    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCategory(@Param('id') id: string) {
        await this.categoryRepository.delete(id);
    }

    /**
     * ADMIN: Seed default categories -- da tao san, tam thoi bo qua
     * POST /api/categories/seed
     */
    @Post('seed/default')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    async seedDefaultCategories() {
        await this.categoryRepository.seedDefaultCategories();

        return {
            success: true,
            message: 'Default categories seeded successfully',
        };
    }
}