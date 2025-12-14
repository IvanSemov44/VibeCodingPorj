<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Don't run potentially-destructive seed logic in production unless explicitly allowed
        if (app()->environment('production') && ! filter_var(env('ALLOW_SEED_IN_PRODUCTION', 'false'), FILTER_VALIDATE_BOOLEAN)) {
            return;
        }

        $users = [
            ['name' => 'Ivan Ivanov', 'email' => 'ivan@admin.local', 'role' => 'owner'],
            ['name' => 'Elena Petrova', 'email' => 'elena@frontend.local', 'role' => 'frontend'],
            ['name' => 'Petar Georgiev', 'email' => 'petar@backend.local', 'role' => 'backend'],
            // Additional seeded users — one per remaining role
            ['name' => 'Maria Dimitrova', 'email' => 'maria@pm.local', 'role' => 'pm'],
            ['name' => 'Nikolay Ivanov', 'email' => 'nikolay@qa.local', 'role' => 'qa'],
            ['name' => 'Anna Georgieva', 'email' => 'anna@designer.local', 'role' => 'designer'],
        ];

        // Wrap seeding in a transaction to avoid partial state on failure
        DB::transaction(function () use ($users) {
            foreach ($users as $u) {
                $attributes = ['email' => $u['email']];
                // Update name each run; only reset password if explicitly enabled
                $values = ['name' => $u['name']];

                if (filter_var(env('DEMO_USER_RESET_PASSWORD', 'false'), FILTER_VALIDATE_BOOLEAN)) {
                    $values['password'] = Hash::make(env('DEMO_USER_PASSWORD', 'P@ssw0rd!'));
                }

                $user = User::updateOrCreate($attributes, $values);

                // Assign role in a safe, idempotent way
                if (method_exists($user, 'syncRoles')) {
                    $user->syncRoles([$u['role']]);
                } elseif (method_exists($user, 'assignRole')) {
                    // assignRole is typically idempotent in common packages
                    $user->assignRole($u['role']);
                } else {
                    $user->role = $u['role'];
                    $user->save();
                }
            }
        });
    }
}
