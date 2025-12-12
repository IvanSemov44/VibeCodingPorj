<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    if (! DB::getSchemaBuilder()->hasTable('activity_logs')) {
        echo "No legacy activity_logs table found; nothing to migrate.\n";
        exit(0);
    }

    if (! DB::getSchemaBuilder()->hasTable('activity_log')) {
        echo "Target table 'activity_log' does not exist. Run migrations first.\n";
        exit(1);
    }

    $rows = DB::table('activity_logs')->orderBy('id')->get();
    $count = 0;
    foreach ($rows as $row) {
        // Build properties JSON by merging existing properties with ip/user agent
        $props = [];
        if (! empty($row->properties)) {
            $decoded = json_decode($row->properties, true);
            if (is_array($decoded)) {
                $props = $decoded;
            }
        }
        if (! empty($row->ip_address)) {
            $props['ip_address'] = $row->ip_address;
        }
        if (! empty($row->user_agent)) {
            $props['user_agent'] = $row->user_agent;
        }

        $record = [
            'log_name' => null,
            'description' => $row->event,
            'subject_type' => $row->auditable_type,
            'subject_id' => $row->auditable_id,
            'causer_type' => $row->user_id ? 'App\\Models\\User' : null,
            'causer_id' => $row->user_id,
            'properties' => json_encode($props),
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
        ];

        // Skip duplicates: check for existing similar row
        $exists = DB::table('activity_log')
            ->where('description', $record['description'])
            ->where('subject_type', $record['subject_type'])
            ->where('subject_id', $record['subject_id'])
            ->where('causer_id', $record['causer_id'])
            ->where('created_at', $record['created_at'])
            ->exists();

        if ($exists) {
            continue;
        }

        DB::table('activity_log')->insert($record);
        $count++;
    }

    echo "Migrated {$count} rows from activity_logs to activity_log\n";
    exit(0);
} catch (Throwable $e) {
    echo 'error: '.$e->getMessage().PHP_EOL;
    exit(1);
}
