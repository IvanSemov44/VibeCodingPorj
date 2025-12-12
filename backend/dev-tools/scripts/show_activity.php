<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $rows = \Illuminate\Support\Facades\DB::table('activity_logs')->orderBy('id', 'desc')->limit(20)->get();
    foreach ($rows as $r) {
        echo json_encode((array) $r).PHP_EOL;
    }
} catch (Throwable $e) {
    echo 'error: '.$e->getMessage().PHP_EOL;
}
