<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Routing\Route;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route as RouteFacade;

final class PostmanCollectionGenerator
{
    private const API_VERSION = '1.0.0';
    private const COLLECTION_NAME = 'VibeCoding API';
    private const BASE_URL_PRODUCTION = 'https://api.vibecoding.com/api';
    private const BASE_URL_LOCAL = 'http://localhost:8201/api';

    /**
     * Generate Postman collection.
     *
     * @return array<string, mixed>
     */
    public function generate(): array
    {
        return [
            'info' => $this->getCollectionInfo(),
            'item' => $this->groupRoutesByController(),
            'variable' => $this->getVariables(),
            'event' => $this->getEvents(),
        ];
    }

    /**
     * Get collection info.
     *
     * @return array<string, mixed>
     */
    private function getCollectionInfo(): array
    {
        return [
            'name' => self::COLLECTION_NAME,
            'description' => 'VibeCoding API endpoints for testing and integration',
            'version' => self::API_VERSION,
            'schema' => 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        ];
    }

    /**
     * Group routes by controller.
     *
     * @return array<int, array<string, mixed>>
     */
    private function groupRoutesByController(): array
    {
        $routes = $this->getApiRoutes();
        $grouped = $routes->groupBy(fn (Route $route) => $this->getControllerName($route))->all();

        return array_map(
            fn (Collection $routes, string $controller) => [
                'name' => $controller,
                'item' => $routes->map(fn (Route $route) => $this->formatRoute($route))->values()->all(),
            ],
            $grouped,
            array_keys($grouped)
        );
    }

    /**
     * Get API routes.
     *
     * @return Collection<int, Route>
     */
    private function getApiRoutes(): Collection
    {
        return collect(RouteFacade::getRoutes())
            ->filter(fn (Route $route) => in_array('api', $route->middleware(), true))
            ->values();
    }

    /**
     * Get controller name from route.
     */
    private function getControllerName(Route $route): string
    {
        $controller = $route->getController();

        if ($controller === null) {
            return 'Other';
        }

        $name = class_basename($controller);

        return str_replace('Controller', '', $name) ?: 'Other';
    }

    /**
     * Format route as Postman request.
     *
     * @return array<string, mixed>
     */
    private function formatRoute(Route $route): array
    {
        $uri = $this->normalizeUri($route->uri);
        $methods = $route->methods;

        return [
            'name' => "{$methods[0]} {$uri}",
            'request' => [
                'method' => $methods[0],
                'header' => $this->getHeaders(),
                'url' => [
                    'raw' => '{{base_url}}/' . ltrim($uri, '/'),
                    'protocol' => 'https',
                    'host' => ['{{domain}}'],
                    'path' => explode('/', ltrim($uri, '/')),
                    'variable' => $this->extractPathVariables($uri),
                ],
                'description' => $this->getRouteDescription($route),
            ],
            'response' => [],
        ];
    }

    /**
     * Normalize URI for Postman.
     */
    private function normalizeUri(string $uri): string
    {
        return preg_replace_callback(
            '/\{([^}]+)\}/',
            fn (array $matches) => ':' . $matches[1],
            $uri
        ) ?? $uri;
    }

    /**
     * Get standard headers.
     *
     * @return array<int, array<string, string>>
     */
    private function getHeaders(): array
    {
        return [
            [
                'key' => 'Accept',
                'value' => 'application/json',
                'type' => 'text',
            ],
            [
                'key' => 'Content-Type',
                'value' => 'application/json',
                'type' => 'text',
            ],
            [
                'key' => 'Authorization',
                'value' => 'Bearer {{token}}',
                'type' => 'text',
                'disabled' => false,
            ],
        ];
    }

    /**
     * Extract path variables from URI.
     *
     * @return array<int, array<string, string>>
     */
    private function extractPathVariables(string $uri): array
    {
        preg_match_all('/\{([^}]+)\}/', $uri, $matches);

        return array_map(
            fn (string $variable) => [
                'key' => $variable,
                'value' => '',
            ],
            $matches[1] ?? []
        );
    }

    /**
     * Get route description.
     */
    private function getRouteDescription(Route $route): string
    {
        $controller = $route->getController();

        if ($controller === null) {
            return 'API endpoint';
        }

        $method = $this->getControllerMethod($route);

        return ucfirst(str_replace('_', ' ', $method));
    }

    /**
     * Get controller method from route.
     */
    private function getControllerMethod(Route $route): string
    {
        $action = $route->getActionName();

        if (str_contains($action, '@')) {
            return explode('@', $action)[1] ?? 'unknown';
        }

        return 'unknown';
    }

    /**
     * Get Postman variables.
     *
     * @return array<int, array<string, string>>
     */
    private function getVariables(): array
    {
        return [
            [
                'key' => 'domain',
                'value' => 'vibecoding.com',
                'type' => 'string',
            ],
            [
                'key' => 'base_url',
                'value' => self::BASE_URL_LOCAL,
                'type' => 'string',
            ],
            [
                'key' => 'token',
                'value' => 'your-api-token-here',
                'type' => 'string',
            ],
            [
                'key' => 'user_id',
                'value' => '1',
                'type' => 'string',
            ],
            [
                'key' => 'tool_id',
                'value' => '1',
                'type' => 'string',
            ],
        ];
    }

    /**
     * Get pre-request and test scripts.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getEvents(): array
    {
        return [
            [
                'listen' => 'prerequest',
                'script' => [
                    'type' => 'text/javascript',
                    'exec' => [
                        '// Pre-request script',
                        'console.log("Sending request to: " + pm.request.url);',
                    ],
                ],
            ],
            [
                'listen' => 'test',
                'script' => [
                    'type' => 'text/javascript',
                    'exec' => [
                        '// Test script',
                        'pm.test("Status is 2xx", function() {',
                        '    pm.response.to.have.status([200, 201, 204]);',
                        '});',
                    ],
                ],
            ],
        ];
    }

    /**
     * Export collection to JSON file.
     */
    public function exportToFile(string $filePath): bool
    {
        $collection = $this->generate();
        $json = json_encode($collection, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            return false;
        }

        return file_put_contents($filePath, $json) !== false;
    }
}
