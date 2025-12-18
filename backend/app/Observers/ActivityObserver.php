<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityObserver
{
    protected function record(Model $model, string $action): void
    {
        try {
            Activity::create([
                'subject_type' => get_class($model),
                'subject_id' => $model->getKey(),
                'action' => $action,
                'user_id' => Auth::id(),
                'meta' => method_exists($model, 'toArray') ? $model->only(array_slice(array_keys($model->getAttributes()), 0, 10)) : null,
            ]);
        } catch (\Throwable $e) {
            // Don't break request if logging fails
            logger()->warning('Failed to record activity: '.$e->getMessage());
        }
    }

    public function created(Model $model): void
    {
        $this->record($model, 'created');
    }

    public function updated(Model $model): void
    {
        $this->record($model, 'updated');
    }

    public function deleted(Model $model): void
    {
        $this->record($model, 'deleted');
    }
}
