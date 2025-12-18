<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CategoryQueryCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_endpoint_executes_bounded_queries(): void
    {
        Category::factory()->count(10)->create();

        DB::flushQueryLog();
        DB::enableQueryLog();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);

        $queries = DB::getQueryLog();
        $count = is_array($queries) ? count($queries) : 0;

        // Allow 2 queries max: one for categories (cached or direct) and one safety
        $this->assertLessThanOrEqual(2, $count, "Expected <=2 queries for categories endpoint, got {$count}");
    }
}
