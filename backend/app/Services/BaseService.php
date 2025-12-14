<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Throwable;

abstract class BaseService
{
    /**
     * Execute a database transaction.
     *
     * @template T
     * @param  callable(): T  $callback
     * @return T
     *
     * @throws Throwable
     */
    protected function transaction(callable $callback): mixed
    {
        return DB::transaction($callback);
    }

    /**
     * Log activity for the given model.
     */
    protected function logActivity(
        object $model,
        string $event,
        ?object $user = null,
        array $properties = []
    ): void {
        $activity = activity()
            ->performedOn($model)
            ->withProperties($properties)
            ->log($event);

        if ($user !== null) {
            $activity->causedBy($user);
        }
    }
}
