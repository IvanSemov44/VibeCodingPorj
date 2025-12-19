<?php

declare(strict_types=1);

namespace App\Actions\Category;

use App\DataTransferObjects\CategoryData;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CreateCategoryAction
{
    /**
     * Create a new category with the given data.
     *
     * @param CategoryData $data The category data transfer object
     * @param object|null $user The user creating the category (for activity logging)
     * @return Category The created category
     */
    public function execute(CategoryData $data, ?object $user = null): Category
    {
        return DB::transaction(function () use ($data, $user): Category {
            // Prepare category data with slug
            $categoryData = $data->toArray();
            $categoryData['slug'] = Str::slug($data->name);

            // Create the category
            $category = Category::create($categoryData);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($category)
                    ->causedBy($user)
                    ->withProperties(['name' => $category->name])
                    ->log('category_created');
            }

            return $category;
        });
    }
}
