<?php

declare(strict_types=1);

namespace App\Actions\Tool;

use App\Enums\ToolStatus;
use App\Models\Tool;

final class ApproveToolAction
{
    public function execute(Tool $tool, object $user): Tool
    {
        $tool->update([
            'status' => ToolStatus::APPROVED->value,
        ]);

        activity()
            ->performedOn($tool)
            ->causedBy($user)
            ->log('tool_approved');

        return $tool;
    }
}
