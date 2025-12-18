<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Updating all tool ratings...\n";

$tools = App\Models\Tool::all();

foreach ($tools as $tool) {
    $before = [
        'avg' => $tool->average_rating,
        'count' => $tool->rating_count,
    ];

    $tool->updateAverageRating();
    $tool->refresh();

    echo "Tool: {$tool->name}\n";
    echo "  Before: avg={$before['avg']}, count={$before['count']}\n";
    echo "  After:  avg={$tool->average_rating}, count={$tool->rating_count}\n\n";
}

echo "Done!\n";
