<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class ExportActivityLogsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly \DateTimeInterface $startDate,
        public readonly \DateTimeInterface $endDate,
        public readonly string $format = 'csv',
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $activities = \App\Models\Activity::query()
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->get();

        // Export based on format
        match ($this->format) {
            'csv' => $this->exportCsv($activities),
            'json' => $this->exportJson($activities),
            default => null,
        };

        // Log job completion
        \Log::info('Activity logs export job processed', [
            'start_date' => $this->startDate->format('Y-m-d'),
            'end_date' => $this->endDate->format('Y-m-d'),
            'format' => $this->format,
            'count' => $activities->count(),
        ]);
    }

    /**
     * Export activities as CSV.
     */
    private function exportCsv($activities): void
    {
        $path = storage_path('app/exports/activities_' . now()->format('Y-m-d_His') . '.csv');

        // Create file and write CSV
        $file = fopen($path, 'w');
        fputcsv($file, ['ID', 'User', 'Action', 'Subject', 'Created At']);

        foreach ($activities as $activity) {
            fputcsv($file, [
                $activity->id,
                $activity->user?->name ?? 'System',
                $activity->action,
                "{$activity->subject_type}:{$activity->subject_id}",
                $activity->created_at->format('Y-m-d H:i:s'),
            ]);
        }

        fclose($file);
    }

    /**
     * Export activities as JSON.
     */
    private function exportJson($activities): void
    {
        $path = storage_path('app/exports/activities_' . now()->format('Y-m-d_His') . '.json');

        $data = $activities->map(fn ($activity) => [
            'id' => $activity->id,
            'user' => $activity->user?->name ?? 'System',
            'action' => $activity->action,
            'subject' => [
                'type' => $activity->subject_type,
                'id' => $activity->subject_id,
            ],
            'created_at' => $activity->created_at->toIso8601String(),
        ]);

        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
