<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\SearchLog;
use App\Models\SearchSuggestion;
use App\Services\SearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class SearchServiceTest extends TestCase
{
    use RefreshDatabase;

    private SearchService $searchService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->searchService = app(SearchService::class);
    }

    public function test_search_returns_results_for_valid_query(): void
    {
        $tool = $this->createTool('Laravel Framework');

        $results = $this->searchService->search('Laravel', 'tools');

        $this->assertGreaterThan(0, $results['total']);
        $this->assertCount(1, $results['tools']);
    }

    public function test_search_returns_empty_for_short_query(): void
    {
        $results = $this->searchService->search('a', 'tools');

        $this->assertEquals(0, $results['total']);
    }

    public function test_search_returns_empty_for_empty_query(): void
    {
        $results = $this->searchService->search('', 'all');

        $this->assertEquals(0, $results['total']);
    }

    public function test_search_tools_by_name(): void
    {
        $this->createTool('React Component Library');
        $this->createTool('Vue Framework');

        $results = $this->searchService->search('React', 'tools');

        $this->assertEquals(1, $results['total']);
    }

    public function test_search_tools_by_description(): void
    {
        $this->createTool('Tool A', 'This is a React-based tool');

        $results = $this->searchService->search('React', 'tools');

        $this->assertEquals(1, $results['total']);
    }

    public function test_search_tracks_response_time(): void
    {
        $this->createTool('Laravel Framework');

        $results = $this->searchService->search('Laravel', 'tools');

        $this->assertGreaterThan(0, $results['response_time_ms']);
    }

    public function test_search_logs_query(): void
    {
        $this->actingAs($this->createUser());
        $this->createTool('Laravel Framework');

        $this->searchService->search('Laravel', 'tools');

        $this->assertDatabaseHas('search_logs', [
            'query' => 'Laravel',
            'search_type' => 'tools',
        ]);
    }

    public function test_search_creates_suggestion_on_results(): void
    {
        $this->createTool('Laravel Framework');

        $this->searchService->search('Laravel', 'tools');

        $this->assertDatabaseHas('search_suggestions', [
            'keyword' => 'laravel',
        ]);
    }

    public function test_search_with_category_filter(): void
    {
        $category = $this->createCategory('PHP');
        $tool = $this->createTool('Laravel', category_id: $category->id);

        $results = $this->searchService->search(
            'Laravel',
            'tools',
            ['category_id' => $category->id]
        );

        $this->assertGreaterThan(0, $results['total']);
    }

    public function test_search_with_rating_filter(): void
    {
        $tool = $this->createTool('Excellent Tool', average_rating: 4.5);

        $results = $this->searchService->search(
            'Excellent',
            'tools',
            ['min_rating' => 4.0]
        );

        $this->assertGreaterThan(0, $results['total']);
    }

    public function test_search_pagination_with_offset(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->createTool("Tool {$i}");
        }

        $resultsPage1 = $this->searchService->search('Tool', 'tools', limit: 2, offset: 0);
        $resultsPage2 = $this->searchService->search('Tool', 'tools', limit: 2, offset: 2);

        $this->assertCount(2, $resultsPage1['tools']);
        $this->assertCount(2, $resultsPage2['tools']);
    }

    public function test_get_suggestions(): void
    {
        SearchSuggestion::create([
            'keyword' => 'laravel',
            'type' => 'tool',
            'search_count' => 10,
            'popularity_score' => 100,
        ]);

        $suggestions = $this->searchService->getSuggestions('lara');

        $this->assertGreaterThan(0, count($suggestions));
    }

    public function test_get_trending_searches(): void
    {
        $user = $this->createUser();
        $this->actingAs($user);

        $this->createTool('Laravel');
        $this->searchService->search('Laravel', 'tools');
        $this->searchService->search('Laravel', 'tools');

        $trending = $this->searchService->getTrendingSearches();

        $this->assertGreaterThan(0, count($trending));
    }

    public function test_get_popular_keywords(): void
    {
        SearchSuggestion::create([
            'keyword' => 'popular',
            'type' => 'tool',
            'search_count' => 100,
            'popularity_score' => 150,
        ]);

        $keywords = $this->searchService->getPopularKeywords('tool');

        $this->assertGreaterThan(0, $keywords->count());
    }

    public function test_suggestion_increments_search_count(): void
    {
        $suggestion = SearchSuggestion::create([
            'keyword' => 'test',
            'type' => 'tool',
        ]);

        $initialCount = $suggestion->search_count;
        $suggestion->incrementSearchCount();

        $this->assertEquals($initialCount + 1, $suggestion->fresh()->search_count);
    }

    public function test_suggestion_updates_popularity_score(): void
    {
        $suggestion = SearchSuggestion::create([
            'keyword' => 'test',
            'type' => 'tool',
            'search_count' => 10,
            'click_count' => 5,
        ]);

        $suggestion->incrementSearchCount();

        $this->assertGreaterThan(0, $suggestion->fresh()->popularity_score);
    }

    private function createTool(
        string $name = 'Test Tool',
        string $description = 'Test Description',
        ?int $category_id = null,
        float $average_rating = 0,
    ): \App\Models\Tool {
        return \App\Models\Tool::factory()->create([
            'name' => $name,
            'description' => $description,
            'category_id' => $category_id,
            'average_rating' => $average_rating,
            'status' => 'published',
        ]);
    }

    private function createCategory(string $name = 'Test Category'): \App\Models\Category
    {
        return \App\Models\Category::factory()->create(['name' => $name]);
    }

    private function createUser(): \App\Models\User
    {
        return \App\Models\User::factory()->create();
    }
}
