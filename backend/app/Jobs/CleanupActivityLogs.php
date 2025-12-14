<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanupActivityLogs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private int $daysToKeep = 90
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $cutoffDate = now()->subDays($this->daysToKeep);

        DB::table('activity_log')
            ->where('created_at', '<', $cutoffDate)
            ->delete();

        Log::info('Activity logs cleanup completed', [
            'cutoff_date' => $cutoffDate->toDateTimeString(),
            'days_kept' => $this->daysToKeep,
        ]);
    }
}
