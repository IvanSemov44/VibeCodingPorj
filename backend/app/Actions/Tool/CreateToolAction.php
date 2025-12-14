<?php

declare(strict_types=1);

namespace App\Actions\Tool;

use App\DataTransferObjects\ToolData;
use App\Models\Tool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CreateToolAction
{
    public function __construct(
        private readonly ResolveTagIdsAction $resolveTagIds
    ) {}

    public function execute(ToolData $data, ?object $user = null): Tool
    {
        return DB::transaction(function () use ($data, $user) {
            // Prepare tool data with slug
            $toolData = $data->toArray();
            $toolData['slug'] = Str::slug($data->name);

            // Create the tool
            $tool = Tool::create($toolData);

            // Sync relationships
            $this->syncRelationships($tool, $data);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($tool)
                    ->causedBy($user)
                    ->withProperties(['name' => $tool->name])
                    ->log('tool_created');
            }

            return $tool->load(['categories', 'tags', 'roles']);
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
