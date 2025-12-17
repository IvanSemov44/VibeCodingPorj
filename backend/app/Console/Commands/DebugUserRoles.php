<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class DebugUserRoles extends Command
{
    protected $signature = 'debug:user-roles';
    protected $description = 'Debug user roles';

    public function handle()
    {
        $user = User::first();

        $this->info("User ID: {$user->id}");
        $this->info("User Name: {$user->name}");
        $this->info("User Email: {$user->email}");

        if (method_exists($user, 'getRoleNames')) {
            $roles = $user->getRoleNames();
            $this->info("Roles (getRoleNames): " . json_encode($roles));
        }

        if (method_exists($user, 'hasAnyRole')) {
            $hasAdminRole = $user->hasAnyRole(['admin', 'owner']);
            $this->info("Has Admin/Owner Role: " . ($hasAdminRole ? 'YES' : 'NO'));
        }

        if (method_exists($user, 'roles')) {
            $roles = $user->roles()->pluck('name')->toArray();
            $this->info("Roles (via relationship): " . json_encode($roles));
        }

        if (isset($user->is_admin)) {
            $this->info("is_admin flag: {$user->is_admin}");
        }
    }
}
