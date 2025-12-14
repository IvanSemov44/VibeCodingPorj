<?php

require __DIR__.'/vendor/autoload.php';

echo "Testing Laravel Bootstrap...\n";

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    echo "✓ App loaded successfully\n";
    echo "App class: " . get_class($app) . "\n";

    // Try to boot the application
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    echo "✓ Console Kernel created\n";
    echo "Kernel class: " . get_class($kernel) . "\n";

    // Try bootstrapping
    $kernel->bootstrap();
    echo "✓ Kernel bootstrapped\n";

    // Test service container
    $config = $app->make('config');
    echo "✓ Config service resolved\n";
    echo "App name: " . $config->get('app.name') . "\n";

    // Test database connection
    try {
        $db = $app->make('db');
        echo "✓ Database service resolved\n";
        echo "DB connection: " . $db->connection()->getName() . "\n";
    } catch (Exception $e) {
        echo "✗ Database error: " . $e->getMessage() . "\n";
    }

    echo "\n✓ Bootstrap test complete!\n";

} catch (Exception $e) {
    echo "✗ Bootstrap failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
