<?php

require __DIR__.'/vendor/autoload.php';

echo "Testing Command Loader Issue...\n\n";

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "✓ Kernel bootstrapped\n\n";

    // Get the Artisan application using reflection
    $reflection = new ReflectionClass($kernel);
    $method = $reflection->getMethod('getArtisan');
    $method->setAccessible(true);
    $artisan = $method->invoke($kernel);
    echo 'Artisan class: '.get_class($artisan)."\n\n";

    // Try to get a command that fails
    echo "Testing ConfigClearCommand...\n";
    $command = $artisan->find('config:clear');

    echo 'Command class: '.get_class($command)."\n";
    echo 'Command has Laravel app: '.($command->getLaravel() ? 'YES' : 'NO')."\n";

    if ($command->getLaravel()) {
        echo 'Laravel app class: '.get_class($command->getLaravel())."\n";
    } else {
        echo "✗ PROBLEM: Command's \$laravel property is NULL!\n";
        echo "This is why commands fail with 'Call to a member function make() on null'\n";
    }

} catch (Exception $e) {
    echo '✗ Error: '.$e->getMessage()."\n";
    echo 'File: '.$e->getFile().':'.$e->getLine()."\n";
}
