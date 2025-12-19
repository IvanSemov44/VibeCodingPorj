<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\WelcomeMailable;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

final class SendWelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly User $user,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Send welcome email to new user
        Mail::send(new WelcomeMailable($this->user));

        // Log job completion
        \Log::info('Welcome email job processed', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
        ]);
    }
}
