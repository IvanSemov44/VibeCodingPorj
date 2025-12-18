<?php

namespace App\Jobs;

use App\Mail\ExportReadyMail;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ExportActivitiesJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     */
    public int $maxExceptions = 1;

    /**
     * Get the number of seconds the job should be retried after all retries are exhausted.
     */
    public function backoff(): array
    {
        return [60, 120, 300];
    }

    public function __construct(
        protected User $user,
        protected array $filters
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting activity export for user: '.$this->user->id);

            $query = Activity::with(['user:id,name,email']);

            // Apply filters
            if (! empty($this->filters['user_id'])) {
                $query->where('user_id', $this->filters['user_id']);
            }

            if (! empty($this->filters['action'])) {
                $query->where('action', $this->filters['action']);
            }

            if (! empty($this->filters['subject_type'])) {
                $query->where('subject_type', 'like', '%'.$this->filters['subject_type'].'%');
            }

            if (! empty($this->filters['date_from'])) {
                $query->where('created_at', '>=', $this->filters['date_from']);
            }

            if (! empty($this->filters['date_to'])) {
                $query->where('created_at', '<=', $this->filters['date_to'].' 23:59:59');
            }

            if (! empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                        ->orWhere('subject_type', 'like', "%{$search}%")
                        ->orWhereRaw('JSON_SEARCH(meta, "one", ?) IS NOT NULL', ["%{$search}%"]);
                });
            }

            $totalCount = $query->count();
            Log::info("Exporting {$totalCount} activity records");

            // Generate filename
            $filename = 'activity-export-'.now()->format('Y-m-d_His').'.csv';
            $path = "exports/activities/{$filename}";
            $fullPath = Storage::path($path);

            // Ensure directory exists
            $exportDir = Storage::path('exports/activities');
            if (! file_exists($exportDir)) {
                mkdir($exportDir, 0755, true);
            }

            // Open file for writing
            $file = fopen($fullPath, 'w');

            // Write CSV header
            fputcsv($file, [
                'ID',
                'Date & Time',
                'User',
                'Email',
                'Role',
                'Action',
                'Subject Type',
                'Subject ID',
                'Changes',
            ]);

            // Stream data in chunks to avoid memory issues
            $chunkSize = 500;
            $query->orderBy('created_at', 'desc')
                ->chunk($chunkSize, function ($activities) use ($file) {
                    foreach ($activities as $activity) {
                        $subject = class_basename($activity->subject_type);
                        $user = $activity->user;
                        $roles = $user && method_exists($user, 'getRoleNames')
                            ? implode(', ', $user->getRoleNames()->toArray())
                            : 'N/A';

                        fputcsv($file, [
                            $activity->id,
                            $activity->created_at->format('Y-m-d H:i:s') ?? 'N/A',
                            $user->name ?? 'System',
                            $user->email ?? 'system@app.local',
                            $roles,
                            $activity->action,
                            $subject,
                            $activity->subject_id,
                            json_encode($activity->meta ?? []),
                        ]);
                    }
                });

            fclose($file);

            Log::info("Activity export completed: {$path}");

            // Send email with download link (mock)
            Mail::to($this->user)->send(new ExportReadyMail($this->user, $filename, $path));

            Log::info('Export notification email sent to: '.$this->user->email);
        } catch (\Throwable $e) {
            Log::error('ExportActivitiesJob failed: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $this->user->id,
            ]);

            // Send error notification
            Mail::to($this->user)->send(new class($this->user, $e)
            {
                public function __construct(protected User $user, protected \Throwable $error) {}

                public function build()
                {
                    return (new \Illuminate\Mail\Mailable)
                        ->markdown('emails.export-failed')
                        ->with([
                            'user' => $this->user,
                            'error' => $this->error->getMessage(),
                        ]);
                }
            });

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Activity export job permanently failed', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
