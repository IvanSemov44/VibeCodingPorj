<?php

namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\MigrateAndSeedWithLock::class,
            \App\Console\Commands\WarmCache::class,
            \App\Console\Commands\ScanQueries::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(\Illuminate\Console\Scheduling\Schedule $schedule)
    {
        //
    }

    /**
     * Register the commands for the application.
     */
    protected function commands()
    {
        // load(__DIR__.'/Commands');
    }

    /**
     * Get the Artisan application instance.
     *
     * Override to fix Laravel 12 command loader issue where setLaravel() is not called.
     */
    protected function getArtisan()
    {
        if (is_null($this->artisan)) {
            $application = new \Illuminate\Console\Application($this->app, $this->events, $this->app->version());
            $application->resolveCommands($this->commands);

            // Get the command map using reflection
            $reflection = new \ReflectionObject($application);
            $property = $reflection->getProperty('commandMap');
            $property->setAccessible(true);
            $commandMap = $property->getValue($application);

            // Use our fixed command loader instead of the default one
            $application->setCommandLoader(
                new FixedContainerCommandLoader($this->app, $commandMap)
            );

            if ($this->symfonyDispatcher instanceof \Illuminate\Contracts\Events\Dispatcher) {
                $application->setDispatcher($this->symfonyDispatcher);
                $application->setSignalsToDispatchEvent();
            }

            $this->artisan = $application;
        }

        return $this->artisan;
    }
}
