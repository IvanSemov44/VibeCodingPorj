<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        using: function () {
            // Load web routes
            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            // Load API routes under /api with the 'api' middleware group
            // This application uses manual routing bootstrap so we must
            // include api routes explicitly here.
            Route::prefix('api')
                ->middleware('api')
                ->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Remove CSRF from web middleware for SPA
        $middleware->web(remove: [
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

// Explicitly bind the application's kernel implementations so the
// app's `App\\Console\\Kernel` (which sets our FixedContainerCommandLoader)
// is used instead of the framework default. This ensures console commands
// resolved from the container have their `$laravel` property set.
$app->singleton(
    \Illuminate\Contracts\Http\Kernel::class,
    \App\Http\Kernel::class
);

$app->singleton(
    \Illuminate\Contracts\Console\Kernel::class,
    \App\Console\Kernel::class
);

return $app;
