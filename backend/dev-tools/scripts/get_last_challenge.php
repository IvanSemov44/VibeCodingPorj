<?php
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TwoFactorChallenge;
use App\Models\User;

$email = $argv[1] ?? 'test@local';
$user = User::where('email', $email)->first();
if (! $user) {
    echo "user_not_found\n";
    exit(1);
}

$challenge = TwoFactorChallenge::where('user_id', $user->id)->orderByDesc('id')->first();
if (! $challenge) {
    echo "no_challenge\n";
    exit(1);
}

echo json_encode([
    'id' => $challenge->id,
    'code' => $challenge->code,
    'type' => $challenge->type,
    'used' => (bool)$challenge->used,
    'expires_at' => $challenge->expires_at?->toDateTimeString(),
], JSON_PRETTY_PRINT) . PHP_EOL;
