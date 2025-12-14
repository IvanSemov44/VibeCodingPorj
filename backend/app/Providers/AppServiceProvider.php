<?php

namespace App\Providers;

use App\Observers\ModelActivityObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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
        // Prevent lazy loading in development to catch N+1 queries
        Model::preventLazyLoading(! app()->isProduction());

        // Register model observer for activity logging on key models
        \App\Models\User::observe(ModelActivityObserver::class);

        // Ensure login rate limiter exists for Fortify/login routes
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input('email', '')).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        if (class_exists(\App\Models\Tool::class)) {
            \App\Models\Tool::observe(ModelActivityObserver::class);
        }

        if (class_exists(\App\Models\TwoFactorChallenge::class)) {
            \App\Models\TwoFactorChallenge::observe(ModelActivityObserver::class);
        }
    }
}
