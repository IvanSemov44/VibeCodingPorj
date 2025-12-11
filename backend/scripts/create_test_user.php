<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $u = App\Models\User::factory()->create([
        'email' => 'test@local',
        'password' => bcrypt('secret123'),
    ]);
    echo "created " . $u->id . PHP_EOL;
} catch (Throwable $e) {
    echo 'error: ' . $e->getMessage() . PHP_EOL;
}
