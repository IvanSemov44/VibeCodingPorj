<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create application roles and seed example users
        $this->call(\Database\Seeders\RoleSeeder::class);
        $this->call(\Database\Seeders\UserSeeder::class);
    }
}
