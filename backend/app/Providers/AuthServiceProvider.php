<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\JournalEntry;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use App\Policies\CategoryPolicy;
use App\Policies\JournalEntryPolicy;
use App\Policies\TagPolicy;
use App\Policies\ToolPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Tool::class => ToolPolicy::class,
        Category::class => CategoryPolicy::class,
        Tag::class => TagPolicy::class,
        JournalEntry::class => JournalEntryPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        // Map permission-style abilities to Spatie permissions.
        // This allows using `$this->authorize('users.edit')` throughout controllers
        // by checking the authenticated user's permissions via Spatie's traits.
        Gate::before(function ($user, $ability) {
            try {
                Log::info('gate_before_debug', ['user_id' => $user?->id, 'ability' => $ability, 'hasRoleMethod' => method_exists($user, 'hasRole')]);
            } catch (\Exception $e) {
                // ignore logging errors
            }
            // Allow full access for an 'owner' role (super-admin)
            if (method_exists($user, 'hasRole') && $user->hasRole('owner')) {
                return true;
            }

            if (method_exists($user, 'hasPermissionTo')) {
                try {
                    if ($user->hasPermissionTo($ability)) {
                        return true;
                    }
                } catch (\Exception $e) {
                    // If permission does not exist or any error occurs, fall back to default
                }
            }

            return null;
        });
    }
}
