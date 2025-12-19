<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AnalyticsPageView;
use App\Models\AnalyticsUserActivity;
use App\Models\Tool;
use App\Models\User;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Analytics Service Tests
 * Tests for analytics data collection and reporting
 */
class AnalyticsServiceTest extends TestCase
{
    use DatabaseTransactions;

    private AnalyticsService $analyticsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->analyticsService = app(AnalyticsService::class);
    }

    /** @test */
    public function it_records_page_views(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $pageView = $this->analyticsService->recordPageView(
            $user,
            $tool,
            '/tools/' . $tool->id,
            'https://referrer.com',
            'Mozilla/5.0',
            '127.0.0.1',
            150
        );

        $this->assertNotNull($pageView->id);
        $this->assertEquals($user->id, $pageView->user_id);
        $this->assertEquals($tool->id, $pageView->tool_id);
        $this->assertEquals('/tools/' . $tool->id, $pageView->page_path);
        $this->assertEquals(150, $pageView->response_time_ms);
    }

    /** @test */
    public function it_records_activities(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $activity = $this->analyticsService->recordActivity(
            $user,
            'tool_create',
            $tool,
            ['tool_id' => $tool->id, 'name' => $tool->name]
        );

        $this->assertNotNull($activity->id);
        $this->assertEquals($user->id, $activity->user_id);
        $this->assertEquals('tool_create', $activity->activity_type);
        $this->assertEquals($tool->id, $activity->tool_id);
    }

    /** @test */
    public function it_retrieves_page_views_for_date_range(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $this->analyticsService->recordPageView($user, $tool, '/test', null, null, null, 100);

        $startDate = now()->subDay();
        $endDate = now()->addDay();

        $views = $this->analyticsService->getPageViews($startDate, $endDate);

        $this->assertCount(1, $views);
    }

    /** @test */
    public function it_retrieves_user_activities_for_date_range(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $this->analyticsService->recordActivity($user, 'tool_create', $tool);

        $startDate = now()->subDay();
        $endDate = now()->addDay();

        $activities = $this->analyticsService->getUserActivities($startDate, $endDate);

        $this->assertCount(1, $activities);
    }

    /** @test */
    public function it_filters_activities_by_type(): void
    {
        $user = User::factory()->create();

        $this->analyticsService->recordActivity($user, 'tool_create');
        $this->analyticsService->recordActivity($user, 'comment_create');

        $startDate = now()->subDay();
        $endDate = now()->addDay();

        $toolCreations = $this->analyticsService->getUserActivities(
            $startDate,
            $endDate,
            null,
            'tool_create'
        );

        $this->assertCount(1, $toolCreations);
    }

    /** @test */
    public function it_gets_dashboard_summary(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $this->analyticsService->recordPageView($user, $tool, '/test', null, null, null, 100);
        $this->analyticsService->recordActivity($user, 'tool_view', $tool);

        $summary = $this->analyticsService->getDashboardSummary();

        $this->assertArrayHasKey('page_views', $summary);
        $this->assertArrayHasKey('unique_users', $summary);
        $this->assertArrayHasKey('average_response_time_ms', $summary);
        $this->assertArrayHasKey('user_activities', $summary);
    }

    /** @test */
    public function it_gets_activity_summary(): void
    {
        $user = User::factory()->create();

        $this->analyticsService->recordActivity($user, 'tool_create');
        $this->analyticsService->recordActivity($user, 'tool_create');
        $this->analyticsService->recordActivity($user, 'comment_create');

        $summary = $this->analyticsService->getActivitySummary();

        $this->assertArrayHasKey('tool_create', $summary);
        $this->assertArrayHasKey('comment_create', $summary);
        $this->assertEquals(2, $summary['tool_create']);
        $this->assertEquals(1, $summary['comment_create']);
    }

    /** @test */
    public function it_gets_top_tools_by_views(): void
    {
        $tool1 = Tool::factory()->create();
        $tool2 = Tool::factory()->create();
        $user = User::factory()->create();

        $this->analyticsService->recordPageView($user, $tool1, '/tools/1');
        $this->analyticsService->recordPageView($user, $tool1, '/tools/1');
        $this->analyticsService->recordPageView($user, $tool2, '/tools/2');

        $topTools = $this->analyticsService->getTopToolsByViews(10);

        $this->assertCount(2, $topTools);
        $this->assertEquals($tool1->id, $topTools[0]['tool_id']);
        $this->assertEquals(2, $topTools[0]['views']);
    }

    /** @test */
    public function it_gets_top_pages(): void
    {
        $user = User::factory()->create();

        $this->analyticsService->recordPageView($user, null, '/page1', null, null, null, 100);
        $this->analyticsService->recordPageView($user, null, '/page1', null, null, null, 150);
        $this->analyticsService->recordPageView($user, null, '/page2', null, null, null, 200);

        $topPages = $this->analyticsService->getTopPages(10);

        $this->assertCount(2, $topPages);
        $this->assertEquals('/page1', $topPages[0]['page']);
        $this->assertEquals(2, $topPages[0]['views']);
    }

    /** @test */
    public function it_calculates_user_engagement_score(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $this->analyticsService->recordPageView($user, $tool, '/test');
        $this->analyticsService->recordActivity($user, 'tool_create', $tool);

        $score = $this->analyticsService->getUserEngagementScore($user);

        $this->assertIsInt($score);
        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    /** @test */
    public function it_calculates_tool_popularity_score(): void
    {
        $tool = Tool::factory()->create();
        $user = User::factory()->create();

        $this->analyticsService->recordPageView($user, $tool, '/tools/' . $tool->id);
        $this->analyticsService->recordActivity($user, 'rating_create', $tool);

        $score = $this->analyticsService->getToolPopularityScore($tool);

        $this->assertIsFloat($score);
        $this->assertGreaterThan(0, $score);
    }

    /** @test */
    public function it_gets_platform_health_metrics(): void
    {
        User::factory()->create();
        Tool::factory()->create();

        $metrics = $this->analyticsService->getPlatformHealthMetrics();

        $this->assertArrayHasKey('total_users', $metrics);
        $this->assertArrayHasKey('total_tools', $metrics);
        $this->assertArrayHasKey('total_categories', $metrics);
        $this->assertArrayHasKey('average_tool_rating', $metrics);
        $this->assertArrayHasKey('daily_active_users', $metrics);
    }

    /** @test */
    public function it_records_anonymous_page_views(): void
    {
        $tool = Tool::factory()->create();

        $pageView = $this->analyticsService->recordPageView(
            null,
            $tool,
            '/tools/' . $tool->id
        );

        $this->assertNull($pageView->user_id);
        $this->assertEquals($tool->id, $pageView->tool_id);
    }

    /** @test */
    public function it_handles_page_views_without_tool(): void
    {
        $user = User::factory()->create();

        $pageView = $this->analyticsService->recordPageView(
            $user,
            null,
            '/home'
        );

        $this->assertEquals($user->id, $pageView->user_id);
        $this->assertNull($pageView->tool_id);
        $this->assertEquals('/home', $pageView->page_path);
    }
}
