<?php

// Usage: php send_email_challenge.php user@example.com
require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$email = $argv[1] ?? 'ivan@admin.local';

$user = User::where('email', $email)->first();
if (! $user) {
    echo json_encode(['ok' => false, 'error' => 'user_not_found', 'email' => $email]);
    exit(1);
}

$service = app()->make(App\Services\TwoFactorService::class);
$challenge = $service->createOtpChallenge($user, 'email');

echo json_encode([
    'ok' => true,
    'email' => $email,
    'challenge_id' => $challenge->id,
    'code' => $challenge->code,
    'expires_at' => $challenge->expires_at->toDateTimeString(),
], JSON_PRETTY_PRINT);
