<?php
// Usage: php exercise_2fa_flow.php [email]
require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Services\TwoFactorService;

$email = $argv[1] ?? 'test@local';

// Ensure user
$user = User::where('email', $email)->first();
if (! $user) {
    $user = User::factory()->create(['email' => $email, 'password' => bcrypt('secret123')]);
    echo "Created user {$email} (id={$user->id})\n";
} else {
    echo "Found user {$email} (id={$user->id})\n";
}

$twoFactor = app()->make(TwoFactorService::class);

// Create an email OTP challenge
$challenge = $twoFactor->createOtpChallenge($user, 'email');
echo "Created email OTP challenge id={$challenge->id}, code={$challenge->code}, expires_at={$challenge->expires_at}\n";

// Verify the challenge using the service
$ok = $twoFactor->verifyOtpChallenge($user, $challenge->code, 'email');
if ($ok) {
    echo "Verification succeeded for code {$challenge->code}\n";
    // Optionally enable two-factor via email flag on user
    $user->two_factor_type = 'email';
    $user->two_factor_confirmed_at = now();
    $user->save();
    echo "Marked user as two_factor_type=email and confirmed.\n";
} else {
    echo "Verification failed for code {$challenge->code}\n";
}

// Show recent activity logs for user
try {
    $rows = \Illuminate\Support\Facades\DB::table('activity_log')->where('causer_id', $user->id)->orderByDesc('id')->limit(10)->get();
    echo "Recent activity_log rows for user id={$user->id}:\n";
    foreach ($rows as $r) {
        echo "- [{$r->created_at}] {$r->description} subject={$r->subject_type}:{$r->subject_id}\n";
    }
} catch (Throwable $e) {
    echo "Could not read activity_log: {$e->getMessage()}\n";
}

exit(0);
