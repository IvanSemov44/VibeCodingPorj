<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class ModelActivityObserver
{
    public function created(Model $model)
    {
        try {
            activity()->performedOn($model)
                ->withProperties(['changes' => $model->getAttributes()])
                ->log(sprintf('%s_created', class_basename($model)));
        } catch (\Throwable $e) {
            Log::warning('Failed to log model creation activity', [
                'model' => get_class($model),
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function updated(Model $model)
    {
        try {
            activity()->performedOn($model)
                ->withProperties(['changes' => $model->getChanges()])
                ->log(sprintf('%s_updated', class_basename($model)));
        } catch (\Throwable $e) {
            Log::warning('Failed to log model update activity', [
                'model' => get_class($model),
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function deleted(Model $model)
    {
        try {
            activity()->performedOn($model)
                ->withProperties(['attributes' => $model->getAttributes()])
                ->log(sprintf('%s_deleted', class_basename($model)));
        } catch (\Throwable $e) {
            Log::warning('Failed to log model deletion activity', [
                'model' => get_class($model),
                'error' => $e->getMessage(),
            ]);
        }
    }
}
