<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class MetricsEndpointTest extends TestCase
{
    public function test_metrics_index_requires_authentication(): void
    {
        $response = $this->getJson('/api/metrics');

        $response->assertStatus(401);
    }

    public function test_metrics_index_returns_all_metrics(): void
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
            'timestamp',
        ]);
    }

    public function test_metrics_requests_endpoint(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics/requests');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_today',
                'total_this_hour',
                'average_response_time_ms',
                'errors_today',
            ],
        ]);
    }

    public function test_metrics_database_endpoint(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics/database');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'status',
            ],
        ]);
    }

    public function test_metrics_cache_endpoint(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics/cache');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'driver',
                'hits',
                'misses',
                'hit_rate',
            ],
        ]);
    }

    public function test_metrics_queue_endpoint(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics/queue');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'driver',
                'jobs_processed',
                'jobs_failed',
                'jobs_pending',
            ],
        ]);
    }

    public function test_metrics_errors_endpoint(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics/errors');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'errors_today',
                'errors_this_week',
                'latest_errors',
            ],
        ]);
    }

    public function test_metrics_uptime_endpoint(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/metrics/uptime');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'seconds',
                'hours',
                'minutes',
                'formatted',
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
            'environment',
            'checks',
        ]);
    }

    public function test_health_database_endpoint(): void
    {
        $response = $this->getJson('/api/health/database');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'timestamp',
            'checks' => [
                'database',
            ],
        ]);
    }

    public function test_health_cache_endpoint(): void
    {
        $response = $this->getJson('/api/health/cache');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'timestamp',
        ]);
    }

    public function test_health_redis_endpoint(): void
    {
        $response = $this->getJson('/api/health/redis');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'timestamp',
        ]);
    }

    public function test_health_storage_endpoint(): void
    {
        $response = $this->getJson('/api/health/storage');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'timestamp',
        ]);
    }

    private function createUser(): \App\Models\User
    {
        return \App\Models\User::factory()->create();
    }
}
