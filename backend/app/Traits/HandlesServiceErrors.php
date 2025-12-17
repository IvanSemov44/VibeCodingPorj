<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Facades\Log;

/**
 * Trait to handle service errors gracefully without excessive try-catch blocks.
 */
trait HandlesServiceErrors
{
    /**
     * Execute a cache operation with error handling.
     *
     * @param callable $operation The cache operation to perform
     * @param string $errorContext Context for logging (e.g., 'invalidate tools cache')
     * @return bool Success status
     */
    protected function handleCacheOperation(callable $operation, string $errorContext): bool
    {
        try {
            $operation();
            return true;
        } catch (\Throwable $e) {
            Log::warning("Cache operation failed ({$errorContext}): " . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Execute an activity logging operation with error handling.
     *
     * @param callable $operation The activity logging operation
     * @param string $errorContext Context for logging
     * @return bool Success status
     */
    protected function handleActivityLog(callable $operation, string $errorContext): bool
    {
        try {
            $operation();
            return true;
        } catch (\Throwable $e) {
            Log::warning("Activity logging failed ({$errorContext}): " . $e->getMessage());
            return false;
        }
    }
}
