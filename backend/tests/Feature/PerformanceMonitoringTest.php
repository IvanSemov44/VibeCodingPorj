<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Services\PerformanceMonitoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

final class PerformanceMonitoringTest extends TestCase
{
    use RefreshDatabase;

    private PerformanceMonitoringService $monitoringService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->monitoringService = app(PerformanceMonitoringService::class);
    }

    public function test_get_metrics_returns_all_metrics(): void
    {
        $metrics = $this->monitoringService->getMetrics();

        $this->assertArrayHasKey('timestamp', $metrics);
        $this->assertArrayHasKey('uptime', $metrics);
        $this->assertArrayHasKey('requests', $metrics);
        $this->assertArrayHasKey('database', $metrics);
        $this->assertArrayHasKey('cache', $metrics);
        $this->assertArrayHasKey('queue', $metrics);
        $this->assertArrayHasKey('errors', $metrics);
    }

    public function test_record_request_increments_counters(): void
    {
        Cache::flush();

        $this->monitoringService->recordRequest(150, false);
        $this->monitoringService->recordRequest(200, false);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(2, $metrics['requests']['total_today']);
    }

    public function test_record_request_tracks_response_time(): void
    {
        Cache::flush();

        $this->monitoringService->recordRequest(100, false);
        $this->monitoringService->recordRequest(200, false);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(150, $metrics['requests']['average_response_time_ms']);
    }

    public function test_record_request_tracks_errors(): void
    {
        Cache::flush();

        $this->monitoringService->recordRequest(100, true);
        $this->monitoringService->recordRequest(200, false);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(1, $metrics['requests']['errors_today']);
    }

    public function test_record_cache_hit_increments_hits(): void
    {
        Cache::flush();

        $this->monitoringService->recordCacheHit(true);
        $this->monitoringService->recordCacheHit(true);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(2, $metrics['cache']['hits']);
    }

    public function test_record_cache_miss_increments_misses(): void
    {
        Cache::flush();

        $this->monitoringService->recordCacheHit(false);
        $this->monitoringService->recordCacheHit(false);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(2, $metrics['cache']['misses']);
    }

    public function test_cache_hit_rate_calculation(): void
    {
        Cache::flush();

        $this->monitoringService->recordCacheHit(true);
        $this->monitoringService->recordCacheHit(true);
        $this->monitoringService->recordCacheHit(false);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(66.67, $metrics['cache']['hit_rate']);
    }

    public function test_record_job_processed_success(): void
    {
        Cache::flush();

        $this->monitoringService->recordJobProcessed(true);
        $this->monitoringService->recordJobProcessed(true);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(2, $metrics['queue']['jobs_processed']);
        $this->assertEquals(0, $metrics['queue']['jobs_failed']);
    }

    public function test_record_job_processed_failure(): void
    {
        Cache::flush();

        $this->monitoringService->recordJobProcessed(false);
        $this->monitoringService->recordJobProcessed(false);

        $metrics = $this->monitoringService->getMetrics();
        $this->assertEquals(0, $metrics['queue']['jobs_processed']);
        $this->assertEquals(2, $metrics['queue']['jobs_failed']);
    }

    public function test_get_metrics_includes_database_info(): void
    {
        $metrics = $this->monitoringService->getMetrics();

        $this->assertArrayHasKey('database', $metrics);
        $this->assertArrayHasKey('status', $metrics['database']);
    }

    public function test_uptime_calculation(): void
    {
        $metrics = $this->monitoringService->getMetrics();

        $this->assertArrayHasKey('uptime', $metrics);
        $this->assertArrayHasKey('seconds', $metrics['uptime']);
        $this->assertArrayHasKey('hours', $metrics['uptime']);
        $this->assertArrayHasKey('minutes', $metrics['uptime']);
        $this->assertArrayHasKey('formatted', $metrics['uptime']);
    }

    public function test_metrics_endpoint_returns_correct_data(): void
    {
        $response = $this->getJson('/api/metrics');

        $response->assertStatus(401); // Requires authentication
    }

    public function test_metrics_endpoint_with_authentication(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'timestamp',
                'uptime',
                'requests',
                'database',
                'cache',
                'queue',
                'errors',
            ],
        ]);
    }

    public function test_health_endpoint_is_public(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'timestamp',
            'app_name',
            'checks',
        ]);
    }

    private function createUser(): \App\Models\User
    {
        return \App\Models\User::factory()->create();
    }
}
