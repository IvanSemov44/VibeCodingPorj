<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Tool;
use App\Models\ToolComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_basic_search_finds_tools(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        Tool::factory()->create([
            'name' => 'Laravel Debugbar',
            'category_id' => $category->id,
        ]);

        Tool::factory()->create([
            'name' => 'Random Tool',
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)->getJson('/api/tools/search?q=Laravel');

        $response->assertOk();
        $results = $response->json('data');
        $this->assertCount(1, $results);
        $this->assertEquals('Laravel Debugbar', $results[0]['name']);
    }

    public function test_advanced_search_with_filters(): void
    {
        $user = User::factory()->create();
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        Tool::factory()->create([
            'name' => 'Tool A',
            'category_id' => $category1->id,
            'rating' => 4.5,
        ]);

        Tool::factory()->create([
            'name' => 'Tool B',
            'category_id' => $category2->id,
            'rating' => 3.5,
        ]);

        $response = $this->actingAs($user)->getJson(
            "/api/tools/search/advanced?category_id={$category1->id}&min_rating=4"
        );

        $response->assertOk();
        $results = $response->json('data');
        $this->assertCount(1, $results);
        $this->assertEquals($category1->id, $results[0]['category_id']);
    }

    public function test_search_with_tags(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $tool = Tool::factory()->create(['category_id' => $category->id]);
        $tool->tags()->sync(['testing', 'debugging']);

        $response = $this->actingAs($user)->getJson('/api/tools/search?tags=testing');

        $response->assertOk();
        $results = $response->json('data');
        $this->assertCount(1, $results);
    }

    public function test_search_history_recorded(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        Tool::factory()->create(['category_id' => $category->id, 'name' => 'Test Tool']);

        $this->actingAs($user)->getJson('/api/tools/search?q=Test');

        $this->assertDatabaseHas('search_histories', [
            'user_id' => $user->id,
            'query' => 'Test',
        ]);
    }

    public function test_search_suggestions_provided(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        Tool::factory()->create(['category_id' => $category->id, 'name' => 'Laravel']);
        Tool::factory()->create(['category_id' => $category->id, 'name' => 'Lava']);

        $response = $this->actingAs($user)->getJson('/api/tools/search/suggestions?q=Lara');

        $response->assertOk();
        $suggestions = $response->json('data');
        $this->assertGreaterThan(0, count($suggestions));
    }
}
