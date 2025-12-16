<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'users.view', 'users.create', 'users.edit', 'users.delete', 'users.ban',
            'tools.view', 'tools.create', 'tools.edit', 'tools.delete', 'tools.approve', 'tools.reject',
            'categories.manage', 'tags.manage',
            'audit.view', 'audit.export',
            'settings.manage',
        ];

        $guard = config('auth.defaults.guard') ?? 'web';
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
        }

        // Assign all permissions to owner
        $owner = Role::where('name', 'owner')->where('guard_name', $guard)->first();
        if ($owner) {
            $owner->givePermissionTo($permissions);
        } else {
            // if an owner role exists with a different guard, repair it
            $existing = Role::where('name', 'owner')->first();
            if ($existing) {
                $existing->guard_name = $guard;
                $existing->save();
                $existing->givePermissionTo($permissions);
            }
        }
    }
}
