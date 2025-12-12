<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendTwoFactorCode implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private User $user,
        private string $code,
        private string $method
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->user->notify(new TwoFactorCodeNotification($this->code, $this->method));

        Log::info('2FA code sent', [
            'user_id' => $this->user->id,
            'method' => $this->method,
        ]);
    }
}
