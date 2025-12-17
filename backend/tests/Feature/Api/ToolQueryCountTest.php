<?php

namespace Tests\Feature\Api;

use App\Models\Tool;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolQueryCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_tools_search_uses_bounded_queries(): void
    {
        // Create several tools with relations
        Tool::factory()->count(10)->create()->each(function ($t) {
            $t->categories()->create(['name' => 'c'.$t->id, 'slug' => 'c-'.$t->id]);
            $t->tags()->create(['name' => 'tag'.$t->id, 'slug' => 'tag-'.$t->id]);
        });

        DB::flushQueryLog();
        DB::enableQueryLog();

        $response = $this->getJson('/api/tools?q=test');

        $response->assertStatus(200);

        $queries = DB::getQueryLog();
        $count = is_array($queries) ? count($queries) : 0;

        // Expectation: at most 6 queries (one for tools, categories, tags, roles, users, maybe count)
        $this->assertLessThanOrEqual(6, $count, "Expected <=6 queries for tools search, got {$count}");
    }
}
