<?php

require __DIR__.'/vendor/autoload.php';

echo "Testing if fix is working...\n\n";

try {
    $app = require_once __DIR__.'/bootstrap/app.php';

    // Check if FixedContainerCommandLoader exists
    if (class_exists('App\Console\FixedContainerCommandLoader')) {
        echo "✓ FixedContainerCommandLoader class exists\n";
    } else {
        echo "✗ FixedContainerCommandLoader class NOT found!\n";
        exit(1);
    }

    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    echo "Kernel class: " . get_class($kernel) . "\n";

    $kernel->bootstrap();
    echo "✓ Kernel bootstrapped\n";

    // Try running config:clear
    echo "\nAttempting to run config:clear...\n";
    $input = new \Symfony\Component\Console\Input\ArrayInput(['command' => 'config:clear']);
    $output = new \Symfony\Component\Console\Output\BufferedOutput();

    $status = $kernel->handle($input, $output);

    echo "Exit status: $status\n";
    echo "Output:\n" . $output->fetch() . "\n";

    if ($status === 0) {
        echo "\n✓ SUCCESS! Command executed without errors!\n";
    } else {
        echo "\n✗ Command failed with status $status\n";
    }

} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
