<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Tool\ApproveToolAction;
use App\Actions\Tool\CreateToolAction;
use App\Actions\Tool\DeleteToolAction;
use App\Actions\Tool\ResolveTagIdsAction;
use App\Actions\Tool\UpdateToolAction;
use App\DataTransferObjects\ToolData;
use App\Models\Tool;

final class ToolService extends BaseService
{
    private readonly CreateToolAction $createAction;

    private readonly UpdateToolAction $updateAction;

    private readonly DeleteToolAction $deleteAction;

    private readonly ApproveToolAction $approveAction;

    public function __construct(
        ?CreateToolAction $createAction = null,
        ?UpdateToolAction $updateAction = null,
        ?DeleteToolAction $deleteAction = null,
        ?ApproveToolAction $approveAction = null,
    ) {
        // Provide sensible defaults so unit tests can instantiate without DI
        if ($createAction === null || $updateAction === null || $deleteAction === null || $approveAction === null) {
            $resolver = new ResolveTagIdsAction;
            $createAction = $createAction ?? new CreateToolAction($resolver);
            $updateAction = $updateAction ?? new UpdateToolAction($resolver);
            $deleteAction = $deleteAction ?? new DeleteToolAction;
            $approveAction = $approveAction ?? new ApproveToolAction;
        }

        $this->createAction = $createAction;
        $this->updateAction = $updateAction;
        $this->deleteAction = $deleteAction;
        $this->approveAction = $approveAction;
    }

    /**
     * Create a new tool.
     */
    /**
     * Accept either a ToolData instance or plain array for test convenience.
     *
     * @param  ToolData|array<string,mixed>  $data
     */
    public function create(ToolData|array $data, ?object $user = null): Tool
    {
        $dto = $data instanceof ToolData ? $data : ToolData::fromRequest($data);

        return $this->createAction->execute($dto, $user);
    }

    /**
     * Update an existing tool.
     */
    /**
     * @param  ToolData|array<string,mixed>  $data
     */
    public function update(Tool $tool, ToolData|array $data, ?object $user = null): Tool
    {
        $dto = $data instanceof ToolData ? $data : ToolData::fromRequest($data);

        return $this->updateAction->execute($tool, $dto, $user);
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
