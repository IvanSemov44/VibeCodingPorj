<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Tool;
use App\Models\ToolComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_tool_creation_and_interaction_workflow(): void
    {
        // Setup
        $creator = User::factory()->create();
        $commenter = User::factory()->create();
        $rater = User::factory()->create();
        $category = Category::factory()->create();

        // Step 1: Create tool
        $createResponse = $this->actingAs($creator)->postJson('/api/tools', [
            'name' => 'New Development Tool',
            'description' => 'A comprehensive tool for development',
            'category_id' => $category->id,
            'url' => 'https://devtool.example.com',
            'tags' => ['development', 'debugging'],
        ]);

        $createResponse->assertCreated();
        $toolId = $createResponse->json('data.id');
        $this->assertNotNull($toolId);

        // Step 2: View tool
        $viewResponse = $this->actingAs($commenter)->getJson("/api/tools/{$toolId}");
        $viewResponse->assertOk();
        $this->assertEquals('New Development Tool', $viewResponse->json('data.name'));

        // Step 3: Add comment
        $commentResponse = $this->actingAs($commenter)->postJson(
            "/api/tools/{$toolId}/comments",
            ['content' => 'Great tool, very useful!']
        );

        $commentResponse->assertCreated();
        $commentId = $commentResponse->json('data.id');

        // Step 4: Rate tool
        $rateResponse = $this->actingAs($rater)->postJson(
            "/api/tools/{$toolId}/ratings",
            ['rating' => 5, 'review' => 'Excellent tool']
        );

        $rateResponse->assertCreated();

        // Step 5: Verify tool details include all interactions
        $detailsResponse = $this->actingAs($creator)->getJson("/api/tools/{$toolId}");
        $detailsResponse->assertOk();

        $tool = $detailsResponse->json('data');
        $this->assertGreater($tool['comments_count'], 0);
        $this->assertGreater($tool['ratings_count'], 0);
        $this->assertGreater($tool['rating'], 0);

        // Step 6: Add to favorites
        $favoriteResponse = $this->actingAs($commenter)->postJson(
            "/api/tools/{$toolId}/favorites"
        );

        $favoriteResponse->assertCreated();

        // Step 7: Search for tool
        $searchResponse = $this->actingAs($rater)->getJson(
            '/api/tools/search?q=Development'
        );

        $searchResponse->assertOk();
        $results = $searchResponse->json('data');
        $this->assertGreater(count($results), 0);

        // Step 8: Edit tool (as creator)
        $editResponse = $this->actingAs($creator)->putJson(
            "/api/tools/{$toolId}",
            [
                'name' => 'Updated Development Tool',
                'description' => 'Updated description',
            ]
        );

        $editResponse->assertOk();

        // Step 9: Verify update
        $updatedResponse = $this->actingAs($commenter)->getJson("/api/tools/{$toolId}");
        $this->assertEquals('Updated Development Tool', $updatedResponse->json('data.name'));
    }

    public function test_tool_with_comments_and_ratings(): void
    {
        $creator = User::factory()->create();
        $users = User::factory(5)->create();
        $category = Category::factory()->create();

        // Create tool
        $createResponse = $this->actingAs($creator)->postJson('/api/tools', [
            'name' => 'Popular Tool',
            'description' => 'A popular tool',
            'category_id' => $category->id,
            'url' => 'https://example.com',
        ]);

        $toolId = $createResponse->json('data.id');

        // Add multiple comments
        foreach ($users as $user) {
            $this->actingAs($user)->postJson(
                "/api/tools/{$toolId}/comments",
                ['content' => "Comment from user {$user->id}"]
            );
        }

        // Add multiple ratings
        $ratings = [5, 4, 5, 3, 5];
        foreach ($users as $index => $user) {
            $this->actingAs($user)->postJson(
                "/api/tools/{$toolId}/ratings",
                ['rating' => $ratings[$index]]
            );
        }

        // Verify aggregated data
        $toolResponse = $this->actingAs($creator)->getJson("/api/tools/{$toolId}");
        $tool = $toolResponse->json('data');

        $this->assertEquals(5, $tool['comments_count']);
        $this->assertEquals(5, $tool['ratings_count']);
        $this->assertEquals(4.4, round($tool['rating'], 1));
    }

    public function test_tool_discovery_workflow(): void
    {
        $user = User::factory()->create();
        $category1 = Category::factory()->create(['name' => 'Development']);
        $category2 = Category::factory()->create(['name' => 'Design']);

        // Create diverse tools
        for ($i = 0; $i < 3; $i++) {
            Tool::factory()->create(['category_id' => $category1->id]);
        }

        for ($i = 0; $i < 2; $i++) {
            Tool::factory()->create(['category_id' => $category2->id]);
        }

        // Step 1: Browse by category
        $categoryResponse = $this->actingAs($user)->getJson(
            "/api/categories/{$category1->id}/tools"
        );

        $categoryResponse->assertOk();
        $this->assertCount(3, $categoryResponse->json('data'));

        // Step 2: Search
        $searchResponse = $this->actingAs($user)->getJson(
            '/api/tools/search?q=tool'
        );

        $searchResponse->assertOk();

        // Step 3: View trending/popular
        $trendingResponse = $this->actingAs($user)->getJson('/api/tools/trending');

        $trendingResponse->assertOk();

        // Step 4: Get recommendations
        $recommendedResponse = $this->actingAs($user)->getJson(
            '/api/tools/recommended'
        );

        $recommendedResponse->assertOk();
    }
}
