<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // create role if missing and assign to user id 5
    if (! class_exists(\Spatie\Permission\Models\Role::class)) {
        echo "Spatie role model not found. Is spatie/laravel-permission installed?\n";
        exit(1);
    }

    $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'owner']);
    $user = App\Models\User::find(5);
    if (! $user) {
        echo "User id 5 not found.\n";
        exit(1);
    }
    $user->assignRole($role->name);
    echo "Assigned role 'owner' to user id 5\n";
} catch (Throwable $e) {
    echo 'error: '.$e->getMessage().PHP_EOL;
    exit(1);
}
