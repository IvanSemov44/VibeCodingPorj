<?php

namespace App\Console;

use Illuminate\Console\Command;
use Illuminate\Console\ContainerCommandLoader;
use Illuminate\Contracts\Container\Container;
use Symfony\Component\Console\Command\Command as SymfonyCommand;

/**
 * Fixed Container Command Loader
 *
 * This extends Laravel's ContainerCommandLoader to fix an issue in Laravel 12
 * where commands loaded from the container don't have their $laravel property set,
 * causing "Call to a member function make() on null" errors.
 */
class FixedContainerCommandLoader extends ContainerCommandLoader
{
    /**
     * The Laravel application instance.
     *
     * @var \Illuminate\Contracts\Container\Container
     */
    protected $laravel;

    /**
     * Create a new command loader instance.
     */
    public function __construct(Container $container, array $commandMap)
    {
        parent::__construct($container, $commandMap);
        $this->laravel = $container;
    }

    /**
     * Resolve a command from the container.
     */
    public function get(string $name): SymfonyCommand
    {
        $command = parent::get($name);

        // Fix: Set Laravel instance on command if it's a Laravel command
        if ($command instanceof Command) {
            // Illuminate console commands expose setLaravel; call directly
            $command->setLaravel($this->laravel);
        }

        return $command;
    }
}
