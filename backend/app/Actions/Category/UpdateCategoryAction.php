<?php

declare(strict_types=1);

namespace App\Actions\Category;

use App\DataTransferObjects\CategoryData;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class UpdateCategoryAction
{
    /**
     * Update an existing category with the given data.
     *
     * @param Category $category The category to update
     * @param CategoryData $data The updated category data
     * @param object|null $user The user performing the update (for activity logging)
     * @return Category The updated category
     */
    public function execute(Category $category, CategoryData $data, ?object $user = null): Category
    {
        return DB::transaction(function () use ($category, $data, $user): Category {
            // Prepare update data with slug
            $categoryData = $data->toArray();
            $categoryData['slug'] = Str::slug($data->name);

            // Update the category
            $category->update($categoryData);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($category)
                    ->causedBy($user)
                    ->withProperties(['name' => $category->name])
                    ->log('category_updated');
            }

            return $category->refresh();
        });
    }
}
