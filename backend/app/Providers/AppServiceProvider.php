<?php

namespace App\Providers;

use App\Observers\ModelActivityObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observer for activity logging on key models
        \App\Models\User::observe(ModelActivityObserver::class);

        if (class_exists(\App\Models\Tool::class)) {
            \App\Models\Tool::observe(ModelActivityObserver::class);
        }

        if (class_exists(\App\Models\TwoFactorChallenge::class)) {
            \App\Models\TwoFactorChallenge::observe(ModelActivityObserver::class);
        }
    }
}
