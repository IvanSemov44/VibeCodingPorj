<?php
/**
 * Usage: php enable_user_2fa.php email@example.com
 * Enables TOTP 2FA for the given user and prints provisioning URI + recovery codes as JSON.
 */
if ($argc < 2) {
    echo "Usage: php enable_user_2fa.php <email>\n";
    exit(1);
}
$email = $argv[1];

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Services\TwoFactorService;

$user = User::where('email', $email)->first();
if (! $user) {
    echo json_encode(['ok' => false, 'error' => 'User not found']);
    exit(1);
}

$twoFactor = $app->make(TwoFactorService::class);

// Generate TOTP secret and recovery codes
$data = $twoFactor->generateTotpSecret($user);

// Mark the user as using totp and confirm it (admin action)
$user->two_factor_type = 'totp';
$user->two_factor_confirmed_at = now();
$user->save();

echo json_encode(array_merge(['ok' => true, 'email' => $user->email], $data), JSON_PRETTY_PRINT);
