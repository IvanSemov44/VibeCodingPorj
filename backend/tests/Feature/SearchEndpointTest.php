<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class SearchEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_endpoint_returns_results(): void
    {
        $tool = $this->createTool('Laravel Framework');

        $response = $this->getJson('/api/search?q=Laravel&type=tools');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'tools',
                'total',
                'response_time_ms',
                'query',
            ],
        ]);
    }

    public function test_search_endpoint_requires_query(): void
    {
        $response = $this->getJson('/api/search');

        $response->assertStatus(422);
    }

    public function test_search_endpoint_validates_query_length(): void
    {
        $response = $this->getJson('/api/search?q=a');

        $response->assertStatus(422);
    }

    public function test_search_endpoint_validates_search_type(): void
    {
        $response = $this->getJson('/api/search?q=test&type=invalid');

        $response->assertStatus(422);
    }

    public function test_search_suggestions_endpoint(): void
    {
        $response = $this->getJson('/api/search/suggestions?q=lar');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'timestamp',
        ]);
    }

    public function test_search_trending_endpoint(): void
    {
        $this->createTool('Popular Tool');
        $this->actingAs($this->createUser());
        app(\App\Services\SearchService::class)->search('Popular', 'tools');

        $response = $this->getJson('/api/search/trending');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'timestamp',
        ]);
    }

    public function test_search_popular_endpoint(): void
    {
        $response = $this->getJson('/api/search/popular?type=tool');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'timestamp',
        ]);
    }

    public function test_search_with_category_filter(): void
    {
        $category = $this->createCategory();
        $tool = $this->createTool(category_id: $category->id);

        $response = $this->getJson("/api/search?q=tool&category_id={$category->id}");

        $response->assertStatus(200);
    }

    public function test_search_with_limit_and_offset(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->createTool("Tool {$i}");
        }

        $response = $this->getJson('/api/search?q=Tool&limit=2&offset=0');

        $response->assertStatus(200);
        $response->assertJson(['data' => ['tools' => []]]);
    }

    private function createTool(
        string $name = 'Test Tool',
        ?int $category_id = null,
    ): \App\Models\Tool {
        return \App\Models\Tool::factory()->create([
            'name' => $name,
            'category_id' => $category_id,
            'status' => 'published',
        ]);
    }

    private function createCategory(): \App\Models\Category
    {
        return \App\Models\Category::factory()->create();
    }

    private function createUser(): \App\Models\User
    {
        return \App\Models\User::factory()->create();
    }
}
