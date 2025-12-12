<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    activity()->withProperties(['test' => 'value'])->log('test_event_from_script');
    echo "logged\n";
} catch (Throwable $e) {
    echo 'error: '.$e->getMessage().PHP_EOL;
}
