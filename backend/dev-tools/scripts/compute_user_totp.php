<?php
require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use OTPHP\TOTP;

$email = $argv[1] ?? 'test@local';
$user = User::where('email', $email)->first();
if (! $user) {
    echo "user_not_found\n";
    exit(1);
}

if (! $user->two_factor_secret) {
    echo "no_secret\n";
    exit(1);
}

try {
    $secret = decrypt($user->two_factor_secret);
    $totp = TOTP::create($secret);
    echo $totp->now() . PHP_EOL;
    exit(0);
} catch (Throwable $e) {
    echo 'error: ' . $e->getMessage() . PHP_EOL;
    exit(1);
}
