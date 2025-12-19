<?php

declare(strict_types=1);

namespace Tests\Traits;

use App\Models\Tool;
use App\Enums\ToolStatus;

/**
 * Helper trait for creating tools in tests.
 */
trait CreatesTools
{
    /**
     * Create a single tool with optional attributes.
     *
     * @param array<string, mixed> $attributes
     * @return Tool
     */
    protected function createTool(array $attributes = []): Tool
    {
        return Tool::factory()->create($attributes);
    }

    /**
     * Create multiple tools.
     *
     * @param int $count
     * @param array<string, mixed> $attributes
     * @return \Illuminate\Database\Eloquent\Collection<int, Tool>
     */
    protected function createTools(int $count = 3, array $attributes = [])
    {
        return Tool::factory()->count($count)->create($attributes);
    }

    /**
     * Create an approved tool.
     *
     * @param array<string, mixed> $attributes
     * @return Tool
     */
    protected function createApprovedTool(array $attributes = []): Tool
    {
        return $this->createTool([
            ...$attributes,
            'status' => ToolStatus::APPROVED,
        ]);
    }

    /**
     * Create multiple approved tools.
     *
     * @param int $count
     * @param array<string, mixed> $attributes
     * @return \Illuminate\Database\Eloquent\Collection<int, Tool>
     */
    protected function createApprovedTools(int $count = 3, array $attributes = [])
    {
        return Tool::factory()
            ->count($count)
            ->create([
                ...$attributes,
                'status' => ToolStatus::APPROVED,
            ]);
    }

    /**
     * Create a pending tool.
     *
     * @param array<string, mixed> $attributes
     * @return Tool
     */
    protected function createPendingTool(array $attributes = []): Tool
    {
        return $this->createTool([
            ...$attributes,
            'status' => ToolStatus::PENDING,
        ]);
    }

    /**
     * Create multiple pending tools.
     *
     * @param int $count
     * @param array<string, mixed> $attributes
     * @return \Illuminate\Database\Eloquent\Collection<int, Tool>
     */
    protected function createPendingTools(int $count = 3, array $attributes = [])
    {
        return Tool::factory()
            ->count($count)
            ->create([
                ...$attributes,
                'status' => ToolStatus::PENDING,
            ]);
    }

    /**
     * Create a rejected tool.
     *
     * @param array<string, mixed> $attributes
     * @return Tool
     */
    protected function createRejectedTool(array $attributes = []): Tool
    {
        return $this->createTool([
            ...$attributes,
            'status' => ToolStatus::REJECTED,
        ]);
    }
}
