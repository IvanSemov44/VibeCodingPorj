<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'cli@local';
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'CLI Test User',
                'password' => Hash::make(env('DEMO_USER_PASSWORD', 'P@ssw0rd!')),
            ]
        );
        if (method_exists($user, 'assignRole')) {
            $user->assignRole('owner');
        }
    }
}
