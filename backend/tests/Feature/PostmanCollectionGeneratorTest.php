<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Services\PostmanCollectionGenerator;
use Tests\TestCase;

final class PostmanCollectionGeneratorTest extends TestCase
{
    private PostmanCollectionGenerator $generator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generator = app(PostmanCollectionGenerator::class);
    }

    public function test_generate_returns_valid_structure(): void
    {
        $collection = $this->generator->generate();

        $this->assertArrayHasKey('info', $collection);
        $this->assertArrayHasKey('item', $collection);
        $this->assertArrayHasKey('variable', $collection);
        $this->assertArrayHasKey('event', $collection);
    }

    public function test_collection_info_is_complete(): void
    {
        $collection = $this->generator->generate();

        $this->assertArrayHasKey('name', $collection['info']);
        $this->assertArrayHasKey('description', $collection['info']);
        $this->assertArrayHasKey('version', $collection['info']);
        $this->assertArrayHasKey('schema', $collection['info']);

        $this->assertEquals('VibeCoding API', $collection['info']['name']);
        $this->assertEquals('1.0.0', $collection['info']['version']);
    }

    public function test_collection_includes_grouped_items(): void
    {
        $collection = $this->generator->generate();

        $this->assertIsArray($collection['item']);
        $this->assertGreaterThan(0, count($collection['item']));

        foreach ($collection['item'] as $group) {
            $this->assertArrayHasKey('name', $group);
            $this->assertArrayHasKey('item', $group);
        }
    }

    public function test_collection_includes_variables(): void
    {
        $collection = $this->generator->generate();

        $this->assertIsArray($collection['variable']);
        $this->assertGreaterThan(0, count($collection['variable']));

        $variableKeys = array_map(fn ($var) => $var['key'], $collection['variable']);
        $this->assertContains('domain', $variableKeys);
        $this->assertContains('base_url', $variableKeys);
        $this->assertContains('token', $variableKeys);
    }

    public function test_collection_includes_events(): void
    {
        $collection = $this->generator->generate();

        $this->assertIsArray($collection['event']);
        $this->assertGreaterThan(0, count($collection['event']));

        $eventListeners = array_map(fn ($event) => $event['listen'], $collection['event']);
        $this->assertContains('prerequest', $eventListeners);
        $this->assertContains('test', $eventListeners);
    }

    public function test_each_route_has_required_fields(): void
    {
        $collection = $this->generator->generate();

        foreach ($collection['item'] as $group) {
            foreach ($group['item'] as $request) {
                $this->assertArrayHasKey('name', $request);
                $this->assertArrayHasKey('request', $request);
                $this->assertArrayHasKey('method', $request['request']);
                $this->assertArrayHasKey('header', $request['request']);
                $this->assertArrayHasKey('url', $request['request']);
            }
        }
    }

    public function test_each_request_has_authorization_header(): void
    {
        $collection = $this->generator->generate();

        foreach ($collection['item'] as $group) {
            foreach ($group['item'] as $request) {
                $headers = array_map(fn ($h) => $h['key'], $request['request']['header']);
                $this->assertContains('Authorization', $headers);
            }
        }
    }

    public function test_export_to_file_creates_valid_json(): void
    {
        $filePath = storage_path('app/postman-collection.json');

        $result = $this->generator->exportToFile($filePath);

        $this->assertTrue($result);
        $this->assertFileExists($filePath);

        $content = file_get_contents($filePath);
        $decoded = json_decode($content, true);

        $this->assertIsArray($decoded);
        $this->assertArrayHasKey('info', $decoded);
        $this->assertArrayHasKey('item', $decoded);

        @unlink($filePath);
    }

    public function test_collection_has_appropriate_base_urls(): void
    {
        $collection = $this->generator->generate();

        $this->assertStringContainsString('{{base_url}}', $collection['variable'][1]['value']);
    }

    public function test_requests_include_path_variables(): void
    {
        $collection = $this->generator->generate();

        $hasPathVariables = false;

        foreach ($collection['item'] as $group) {
            foreach ($group['item'] as $request) {
                if (!empty($request['request']['url']['variable'])) {
                    $hasPathVariables = true;
                    break 2;
                }
            }
        }

        $this->assertTrue($hasPathVariables);
    }

    public function test_health_endpoint_included_in_collection(): void
    {
        $collection = $this->generator->generate();

        $found = false;

        foreach ($collection['item'] as $group) {
            foreach ($group['item'] as $request) {
                if (str_contains($request['name'], 'health')) {
                    $found = true;
                    break 2;
                }
            }
        }

        $this->assertTrue($found);
    }
}
