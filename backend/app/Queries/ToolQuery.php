<?php

declare(strict_types=1);

namespace App\Queries;

use App\Enums\ToolStatus;
use App\Models\Tool;
use Illuminate\Database\Eloquent\Builder;

final class ToolQuery
{
    private Builder $query;

    public function __construct()
    {
        $this->query = Tool::query();
    }

    public static function make(): self
    {
        return new self();
    }

    /**
     * Search tools by name, description, or usage.
     */
    public function search(?string $term): self
    {
        if ($term !== null && $term !== '') {
            $this->query->search($term);
        }
        return $this;
    }

    /**
     * Filter by category slug or name.
     */
    public function withCategory(?string $category): self
    {
        if ($category !== null && $category !== '') {
            $this->query->whereHas('categories', fn (Builder $q) =>
                $q->where('slug', $category)->orWhere('name', $category)
            );
        }
        return $this;
    }

    /**
     * Filter by tool status.
     */
    public function withStatus(ToolStatus $status): self
    {
        $this->query->where('status', $status);
        return $this;
    }

    /**
     * Filter by single tag slug or name.
     */
    public function withTag(?string $tag): self
    {
        if ($tag !== null && $tag !== '') {
            $this->query->whereHas('tags', fn (Builder $t) =>
                $t->where('slug', $tag)->orWhere('name', $tag)
            );
        }
        return $this;
    }

    /**
     * Filter by multiple tags.
     *
     * @param array<string> $tags
     */
    public function withTags(array $tags): self
    {
        if (!empty($tags)) {
            $this->query->whereHas('tags', function (Builder $q) use ($tags): void {
                $q->whereIn('slug', $tags)->orWhereIn('name', $tags);
            });
        }
        return $this;
    }

    /**
     * Filter by role.
     */
    public function withRole(?string $role): self
    {
        if ($role !== null && $role !== '') {
            $this->query->whereHas('roles', fn (Builder $r) =>
                $r->where('name', $role)
            );
        }
        return $this;
    }

    /**
     * Eager load relations for full display.
     */
    public function withRelations(): self
    {
        $this->query->with(['categories', 'tags', 'roles', 'user']);
        return $this;
    }

    /**
     * Eager load minimal relations for search results.
     */
    public function withRelationsForSearch(): self
    {
        $this->query->with(['categories:id,name,slug', 'tags:id,name,slug']);
        return $this;
    }

    /**
     * Eager load relations for admin display (with comments and ratings).
     */
    public function withRelationsForAdmin(): self
    {
        $this->query->with(['categories', 'tags', 'roles', 'user', 'comments', 'ratings']);
        return $this;
    }

    /**
     * Filter to approved tools only.
     */
    public function approved(): self
    {
        return $this->withStatus(ToolStatus::APPROVED);
    }

    /**
     * Filter to pending tools only.
     */
    public function pending(): self
    {
        return $this->withStatus(ToolStatus::PENDING);
    }

    /**
     * Filter to rejected tools only.
     */
    public function rejected(): self
    {
        return $this->withStatus(ToolStatus::REJECTED);
    }

    /**
     * Order by name ascending.
     */
    public function orderByName(): self
    {
        $this->query->orderBy('name');
        return $this;
    }

    /**
     * Order by most recently created.
     */
    public function orderByNewest(): self
    {
        $this->query->orderByDesc('created_at');
        return $this;
    }

    /**
     * Order by most recently updated.
     */
    public function orderByUpdated(): self
    {
        $this->query->orderByDesc('updated_at');
        return $this;
    }

    /**
     * Order by most viewed.
     */
    public function orderByViews(): self
    {
        $this->query->orderByDesc('view_count');
        return $this;
    }

    /**
     * Order by rating.
     */
    public function orderByRating(): self
    {
        $this->query->orderByDesc('average_rating');
        return $this;
    }

    /**
     * Get the underlying query builder.
     */
    public function getQuery(): Builder
    {
        return $this->query;
    }
}
