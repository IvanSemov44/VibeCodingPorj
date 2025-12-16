<?php

declare(strict_types=1);

namespace App\Actions\Tool;

use App\Enums\ToolStatus;
use App\Models\Tool;

final class RejectToolAction
{
    public function execute(Tool $tool, object $user, ?string $reason = null): Tool
    {
        $tool->update([
            'status' => ToolStatus::REJECTED->value,
            'rejection_reason' => $reason,
        ]);

        activity()
            ->performedOn($tool)
            ->causedBy($user)
            ->withProperties(['reason' => $reason])
            ->log('tool_rejected');

        return $tool->fresh();
    }
}
