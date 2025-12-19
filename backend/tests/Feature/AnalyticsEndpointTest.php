<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Analytics Endpoint Tests
 * Tests for analytics API endpoints (admin only)
 */
class AnalyticsEndpointTest extends TestCase
{
    use DatabaseTransactions;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /** @test */
    public function it_requires_admin_for_analytics_dashboard(): void
    {
        $response = $this->getJson('/api/admin/analytics/dashboard');

        $response->assertUnauthorized();
    }

    /** @test */
    public function it_returns_dashboard_summary(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'date',
                    'page_views',
                    'unique_users',
                    'average_response_time_ms',
                    'user_activities',
                    'trending_tools',
                    'top_categories',
                ],
            ]);
    }

    /** @test */
    public function it_returns_health_metrics(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/health');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'total_users',
                    'total_tools',
                    'total_categories',
                    'average_tool_rating',
                    'daily_active_users',
                    'date',
                ],
            ]);
    }

    /** @test */
    public function it_returns_activity_summary(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/activity');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
            ]);
    }

    /** @test */
    public function it_returns_trending_tools(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/trending');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'count',
            ]);
    }

    /** @test */
    public function it_returns_category_statistics(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/categories');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'count',
            ]);
    }

    /** @test */
    public function it_returns_top_tools(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/top-tools');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'count',
            ]);
    }

    /** @test */
    public function it_returns_top_pages(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/top-pages');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'count',
            ]);
    }

    /** @test */
    public function it_returns_user_engagement_score(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/analytics/user/{$user->id}/engagement");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'user_id',
                    'user_name',
                    'engagement_score',
                ],
            ]);
    }

    /** @test */
    public function it_accepts_date_parameters(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/dashboard?date=2025-12-19');

        $response->assertOk();
    }

    /** @test */
    public function it_accepts_period_parameter(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/trending?period=weekly');

        $response->assertOk();
    }

    /** @test */
    public function it_accepts_limit_parameter(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/top-tools?limit=20');

        $response->assertOk()
            ->assertJson([
                'count' => 0,
            ]);
    }

    /** @test */
    public function it_validates_page_views_date_range(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/page-views');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['start_date', 'end_date']);
    }

    /** @test */
    public function it_validates_end_date_after_start_date(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/page-views?start_date=2025-12-20&end_date=2025-12-19');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('end_date');
    }

    /** @test */
    public function it_returns_page_views_with_valid_dates(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/page-views?start_date=2025-12-18&end_date=2025-12-20');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'count',
            ]);
    }

    /** @test */
    public function it_filters_page_views_by_tool(): void
    {
        $tool = Tool::factory()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/analytics/page-views?start_date=2025-12-18&end_date=2025-12-20&tool_id={$tool->id}");

        $response->assertOk();
    }

    /** @test */
    public function it_returns_user_activities_with_valid_dates(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/activities?start_date=2025-12-18&end_date=2025-12-20');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'count',
            ]);
    }

    /** @test */
    public function it_filters_activities_by_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/analytics/activities?start_date=2025-12-18&end_date=2025-12-20&user_id={$user->id}");

        $response->assertOk();
    }

    /** @test */
    public function it_filters_activities_by_type(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/analytics/activities?start_date=2025-12-18&end_date=2025-12-20&activity_type=tool_create');

        $response->assertOk();
    }

    /** @test */
    public function non_admin_cannot_access_analytics(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/admin/analytics/dashboard');

        $response->assertForbidden();
    }
}
