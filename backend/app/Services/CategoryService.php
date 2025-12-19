<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Category\CreateCategoryAction;
use App\Actions\Category\UpdateCategoryAction;
use App\DataTransferObjects\CategoryData;
use App\Models\Category;

final readonly class CategoryService
{
    public function __construct(
        private CreateCategoryAction $createAction,
        private UpdateCategoryAction $updateAction,
        private $deleteAction,
    ) {}

    /**
     * Create a new category.
     *
     * @param CategoryData $data The category data transfer object
     * @param object|null $user The user creating the category
     * @return Category The created category
     */
    public function create(CategoryData $data, ?object $user = null): Category
    {
        return $this->createAction->execute($data, $user);
    }

    /**
     * Update an existing category.
     *
     * @param Category $category The category to update
     * @param CategoryData $data The updated category data
     * @param object|null $user The user performing the update
     * @return Category The updated category
     */
    public function update(Category $category, CategoryData $data, ?object $user = null): Category
    {
        return $this->updateAction->execute($category, $data, $user);
    }

    /**
     * Delete a category.
     *
     * @param Category $category The category to delete
     * @param object|null $user The user deleting the category
     * @return bool True if deletion was successful
     */
    public function delete(Category $category, ?object $user = null): bool
    {
        return $this->deleteAction->execute($category, $user);
    }
}
