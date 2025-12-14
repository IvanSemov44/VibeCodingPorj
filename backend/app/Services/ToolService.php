<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Tool\ApproveToolAction;
use App\Actions\Tool\CreateToolAction;
use App\Actions\Tool\DeleteToolAction;
use App\Actions\Tool\UpdateToolAction;
use App\DataTransferObjects\ToolData;
use App\Models\Tool;

final class ToolService extends BaseService
{
    public function __construct(
        private readonly CreateToolAction $createAction,
        private readonly UpdateToolAction $updateAction,
        private readonly DeleteToolAction $deleteAction,
        private readonly ApproveToolAction $approveAction,
    ) {}

    /**
     * Create a new tool.
     */
    public function create(ToolData $data, ?object $user = null): Tool
    {
        return $this->createAction->execute($data, $user);
    }

    /**
     * Update an existing tool.
     */
    public function update(Tool $tool, ToolData $data, ?object $user = null): Tool
    {
        return $this->updateAction->execute($tool, $data, $user);
    }

    /**
     * Delete a tool.
     */
    public function delete(Tool $tool, ?object $user = null): bool
    {
        return $this->deleteAction->execute($tool, $user);
    }

    /**
     * Approve a tool (admin action).
     */
    public function approve(Tool $tool, object $user): Tool
    {
        return $this->approveAction->execute($tool, $user);
    }
}
