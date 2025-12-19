<?php

declare(strict_types=1);

namespace App\Queries;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Builder;

final class ActivityQuery
{
    private Builder $query;

    public function __construct()
    {
        $this->query = Activity::query();
    }

    public static function make(): self
    {
        return new self();
    }

    /**
     * Filter by causer (user who performed the action).
     */
    public function byCauser(int $userId): self
    {
        $this->query->whereCausedBy($userId);
        return $this;
    }

    /**
     * Filter by subject type (model being acted upon).
     */
    public function forSubjectType(string $subjectType): self
    {
        $this->query->where('subject_type', $subjectType);
        return $this;
    }

    /**
     * Filter by subject id.
     */
    public function forSubjectId(int $subjectId): self
    {
        $this->query->where('subject_id', $subjectId);
        return $this;
    }

    /**
     * Filter by event name.
     */
    public function withEvent(string $event): self
    {
        $this->query->where('event', $event);
        return $this;
    }

    /**
     * Filter activities after a given date.
     */
    public function since(\DateTimeInterface $date): self
    {
        $this->query->where('created_at', '>=', $date);
        return $this;
    }

    /**
     * Filter activities before a given date.
     */
    public function until(\DateTimeInterface $date): self
    {
        $this->query->where('created_at', '<=', $date);
        return $this;
    }

    /**
     * Eager load causer relationship.
     */
    public function withCauser(): self
    {
        $this->query->with('causer');
        return $this;
    }

    /**
     * Eager load subject relationship.
     */
    public function withSubject(): self
    {
        $this->query->with('subject');
        return $this;
    }

    /**
     * Order by most recent first.
     */
    public function latest(): self
    {
        $this->query->latest('created_at');
        return $this;
    }

    /**
     * Order by oldest first.
     */
    public function oldest(): self
    {
        $this->query->oldest('created_at');
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
