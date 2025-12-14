<?php

declare(strict_types=1);

namespace App\Actions\Tool;

use App\Models\Tool;
use Illuminate\Support\Facades\DB;

final class DeleteToolAction
{
    public function execute(Tool $tool, ?object $user = null): bool
    {
        return DB::transaction(function () use ($tool, $user) {
            $toolData = $tool->toArray();

            // Log before deletion
            if ($user !== null) {
                activity()
                    ->performedOn($tool)
                    ->causedBy($user)
                    ->withProperties(['tool' => $toolData])
                    ->log('tool_deleted');
            }

            return $tool->delete();
        });
    }
}
