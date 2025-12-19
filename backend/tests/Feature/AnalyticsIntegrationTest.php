<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AnalyticsPageView;
use App\Models\AnalyticsUserActivity;
use App\Models\Category;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_page_view_recording(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        Tool::factory()->create(['category_id' => $category->id]);

        // Simulate user viewing pages
        $this->actingAs($user)->getJson('/api/tools/1')->assertOk();

        // Check analytics recorded
        $viewsResponse = $this->actingAs($admin)->getJson(
            '/api/admin/analytics/page-views?start_date=2025-01-01&end_date=2025-12-31'
        );

        $viewsResponse->assertOk();
    }

    public function test_activity_recording(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        Tool::factory()->create(['category_id' => $category->id]);

        // Simulate user activities
        $this->actingAs($user)->postJson('/api/tools', [
            'name' => 'New Tool',
            'description' => 'Test tool',
            'category_id' => $category->id,
            'url' => 'https://example.com',
        ]);

        // Check analytics
        $statsResponse = $this->actingAs($admin)->getJson(
            '/api/admin/analytics/statistics'
        );

        $statsResponse->assertOk();
    }

    public function test_dashboard_summary(): void
    {
        $admin = User::factory()->admin()->create();

        $dashResponse = $this->actingAs($admin)->getJson(
            '/api/admin/analytics/dashboard'
        );

        $dashResponse->assertOk();
        $data = $dashResponse->json('data');

        $this->assertArrayHasKey('date', $data);
        $this->assertArrayHasKey('page_views', $data);
        $this->assertArrayHasKey('unique_users', $data);
    }

    public function test_health_metrics(): void
    {
        $admin = User::factory()->admin()->create();

        $healthResponse = $this->actingAs($admin)->getJson(
            '/api/admin/analytics/health'
        );

        $healthResponse->assertOk();
        $data = $healthResponse->json('data');

        $this->assertArrayHasKey('total_users', $data);
        $this->assertArrayHasKey('total_tools', $data);
        $this->assertArrayHasKey('average_tool_rating', $data);
    }

    public function test_trending_tools(): void
    {
        $admin = User::factory()->admin()->create();

        $trendingResponse = $this->actingAs($admin)->getJson(
            '/api/admin/analytics/trending'
        );

        $trendingResponse->assertOk();
    }

    public function test_top_tools_report(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        Tool::factory(3)->create(['category_id' => $category->id]);

        $topResponse = $this->actingAs($admin)->getJson(
            '/api/admin/analytics/top-tools?limit=10'
        );

        $topResponse->assertOk();
        $this->assertIsArray($topResponse->json('data'));
    }

    public function test_user_engagement_score(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        Tool::factory()->create(['category_id' => $category->id]);

        // User performs activities
        $this->actingAs($user)->getJson('/api/tools/1');
        $this->actingAs($user)->getJson('/api/tools/1');

        $engagementResponse = $this->actingAs($admin)->getJson(
            "/api/admin/analytics/user/{$user->id}/engagement"
        );

        $engagementResponse->assertOk();
        $this->assertArrayHasKey('score', $engagementResponse->json('data'));
    }
}
