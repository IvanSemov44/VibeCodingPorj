<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    if (! DB::getSchemaBuilder()->hasTable('activity_logs')) {
        echo "No activity_logs table found; nothing to back up.\n";
        exit(0);
    }

    $rows = DB::table('activity_logs')->orderBy('id')->get();
    $dir = __DIR__.'/../storage/backups';
    if (! is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $file = $dir.'/activity_logs_'.date('Ymd_His').'.json';
    file_put_contents($file, json_encode($rows, JSON_PRETTY_PRINT));
    echo 'Backed up '.count($rows)." rows to {$file}\n";
    exit(0);
} catch (Throwable $e) {
    echo 'error: '.$e->getMessage().PHP_EOL;
    exit(1);
}
