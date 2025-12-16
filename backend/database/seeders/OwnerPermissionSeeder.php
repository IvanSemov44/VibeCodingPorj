<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class OwnerPermissionSeeder extends Seeder
{
    public function run()
    {
        $guard = config('auth.defaults.guard') ?? 'web';

        // ensure permission exists with correct guard
        $perm = Permission::firstOrCreate([
            'name' => 'users.edit',
            'guard_name' => $guard,
        ]);

        // ensure role exists with guard and give permission
        $role = Role::firstOrCreate([
            'name' => 'owner',
            'guard_name' => $guard,
        ]);
        if (! $role->hasPermissionTo($perm->name)) {
            $role->givePermissionTo($perm->name);
            $this->command->info("Granted '{$perm->name}' to role 'owner'.");
        } else {
            $this->command->info("Role 'owner' already has '{$perm->name}'.");
        }
    }
}
