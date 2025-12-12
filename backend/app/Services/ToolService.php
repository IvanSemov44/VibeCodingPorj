<?php

namespace App\Services;

use App\Models\Tag;
use App\Models\Tool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ToolService
{
    /**
     * Create a new tool.
     *
     * @param  \App\Models\User|null  $user
     */
    public function create(array $data, $user = null): Tool
    {
        $data['slug'] = Str::slug($data['name']);

        return DB::transaction(function () use ($data, $user) {
            $tool = Tool::create($data);

            // Sync relationships
            if (! empty($data['categories'])) {
                $tool->categories()->sync($data['categories']);
            }

            if (! empty($data['tags'])) {
                $tool->tags()->sync($this->resolveTagIds($data['tags']));
            }

            if (! empty($data['roles'])) {
                $tool->roles()->sync($data['roles']);
            }

            // Log activity
            if ($user) {
                activity()
                    ->performedOn($tool)
                    ->causedBy($user)
                    ->withProperties(['name' => $tool->name])
                    ->log('tool_created');
            }

            return $tool->load(['categories', 'tags', 'roles']);
        });
    }

    /**
     * Update an existing tool.
     *
     * @param  \App\Models\User|null  $user
     */
    public function update(Tool $tool, array $data, $user = null): Tool
    {
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return DB::transaction(function () use ($tool, $data, $user) {
            $oldData = $tool->toArray();
            $tool->update($data);

            // Sync relationships if provided
            if (isset($data['categories'])) {
                $tool->categories()->sync($data['categories']);
            }

            if (isset($data['tags'])) {
                $tool->tags()->sync($this->resolveTagIds($data['tags']));
            }

            if (isset($data['roles'])) {
                $tool->roles()->sync($data['roles']);
            }

            // Log activity
            if ($user) {
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

    /**
     * Delete a tool.
     *
     * @param  \App\Models\User|null  $user
     */
    public function delete(Tool $tool, $user = null): bool
    {
        return DB::transaction(function () use ($tool, $user) {
            $toolData = $tool->toArray();

            // Log before deletion
            if ($user) {
                activity()
                    ->performedOn($tool)
                    ->causedBy($user)
                    ->withProperties(['tool' => $toolData])
                    ->log('tool_deleted');
            }

            return $tool->delete();
        });
    }

    /**
     * Resolve tag IDs from tag names (create if not exists).
     */
    protected function resolveTagIds(array $tags): array
    {
        $tagIds = [];

        foreach ($tags as $tag) {
            if (is_numeric($tag)) {
                // Already an ID
                $tagIds[] = $tag;
            } else {
                // Tag name - find or create
                $tagModel = Tag::firstOrCreate(
                    ['slug' => Str::slug($tag)],
                    ['name' => $tag]
                );
                $tagIds[] = $tagModel->id;
            }
        }

        return $tagIds;
    }

    /**
     * Approve a tool (admin action).
     *
     * @param  \App\Models\User  $user
     */
    public function approve(Tool $tool, $user): Tool
    {
        $tool->update([
            'status' => 'approved',
        ]);

        activity()
            ->performedOn($tool)
            ->causedBy($user)
            ->log('tool_approved');

        return $tool;
    }
}
