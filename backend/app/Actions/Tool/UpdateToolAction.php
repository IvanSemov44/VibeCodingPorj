<?php

declare(strict_types=1);

namespace App\Actions\Tool;

use App\DataTransferObjects\ToolData;
use App\Models\Tool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class UpdateToolAction
{
    public function __construct(
        private readonly ResolveTagIdsAction $resolveTagIds
    ) {}

    public function execute(Tool $tool, ToolData $data, ?object $user = null): Tool
    {
        return DB::transaction(function () use ($tool, $data, $user) {
            $oldData = $tool->toArray();

            // Prepare tool data with slug
            $toolData = $data->toArray();
            $toolData['slug'] = Str::slug($data->name);

            // Update the tool
            $tool->update($toolData);

            // Sync relationships
            $this->syncRelationships($tool, $data);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($tool)
                    ->causedBy($user)
                    ->withProperties([
                        'old' => $oldData,
                        'new' => $tool->getChanges(),
                    ])
                    ->log('tool_updated');
            }

            return $tool->fresh(['categories', 'tags', 'roles']);
        });
    }

    private function syncRelationships(Tool $tool, ToolData $data): void
    {
        if (! empty($data->categoryIds)) {
            $tool->categories()->sync($data->categoryIds);
        }

        if (! empty($data->tags)) {
            $tagIds = $this->resolveTagIds->execute($data->tags);
            $tool->tags()->sync($tagIds);
        }

        if (! empty($data->roleIds)) {
            $tool->roles()->sync($data->roleIds);
        }
    }
}
