<?php

declare(strict_types=1);

namespace Tests\Unit\Actions\Category;

use App\Actions\Category\CreateCategoryAction;
use App\DataTransferObjects\CategoryData;
use App\Models\Category;
use App\Models\User;
use Tests\TestCase;

class CreateCategoryActionTest extends TestCase
{
    private CreateCategoryAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new CreateCategoryAction();
    }

    public function test_create_category_with_basic_data(): void
    {
        $data = new CategoryData(
            name: 'Web Development',
            description: 'Tools for web development'
        );

        $category = $this->action->execute($data);

        $this->assertInstanceOf(Category::class, $category);
        $this->assertEquals('Web Development', $category->name);
        $this->assertEquals('web-development', $category->slug);
        $this->assertEquals('Tools for web development', $category->description);
        $this->assertDatabaseHas('categories', [
            'name' => 'Web Development',
            'slug' => 'web-development',
        ]);
    }

    public function test_create_category_without_description(): void
    {
        $data = new CategoryData(name: 'Design');

        $category = $this->action->execute($data);

        $this->assertNull($category->description);
        $this->assertEquals('design', $category->slug);
    }

    public function test_create_category_logs_activity(): void
    {
        $user = User::factory()->create();
        $data = new CategoryData(name: 'Testing');

        $category = $this->action->execute($data, $user);

        $activities = $user->activities;
        $this->assertTrue($activities->contains(fn ($activity) =>
            $activity->event === 'category_created' &&
            $activity->subject_id === $category->id
        ));
    }

    public function test_create_category_without_user(): void
    {
        $data = new CategoryData(name: 'Database');

        $category = $this->action->execute($data);

        $this->assertNotNull($category->id);
        $this->assertEquals('Database', $category->name);
    }

    public function test_create_category_with_special_characters_in_slug(): void
    {
        $data = new CategoryData(name: 'C++ & C#');

        $category = $this->action->execute($data);

        // Laravel's Str::slug converts special chars to hyphens
        $this->assertStringContainsString('c', $category->slug);
    }
}
