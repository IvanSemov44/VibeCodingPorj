<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Ivan Ivanov', 'email' => 'ivan@admin.local', 'role' => 'owner'],
            ['name' => 'Elena Petrova', 'email' => 'elena@frontend.local', 'role' => 'frontend'],
            ['name' => 'Petar Georgiev', 'email' => 'petar@backend.local', 'role' => 'backend'],
            // Additional seeded users — one per remaining role
            ['name' => 'Maria Dimitrova', 'email' => 'maria@pm.local', 'role' => 'pm'],
            ['name' => 'Nikolay Ivanov', 'email' => 'nikolay@qa.local', 'role' => 'qa'],
            ['name' => 'Anna Georgieva', 'email' => 'anna@designer.local', 'role' => 'designer'],
        ];

        foreach ($users as $u) {
            $user = User::firstOrCreate(
                ['email' => $u['email']],
                // Use environment-configurable demo password or a random value to avoid hardcoding secrets
                ['name' => $u['name'], 'password' => Hash::make(env('DEMO_USER_PASSWORD', \Illuminate\Support\Str::random(12)))]
            );
            if (method_exists($user, 'assignRole')) {
                $user->assignRole($u['role']);
            } else {
                $user->role = $u['role'];
                $user->save();
            }
        }
    }
}
