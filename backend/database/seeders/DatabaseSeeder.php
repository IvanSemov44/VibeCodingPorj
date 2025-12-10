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
        // Create application roles and seed example users and tools
        $this->call(\Database\Seeders\RoleSeeder::class);
        $this->call(\Database\Seeders\UserSeeder::class);
        // Ensure categories and tags exist before seeding tools that may reference them
        $this->call(\Database\Seeders\CategorySeeder::class);
        $this->call(\Database\Seeders\TagSeeder::class);
        $this->call(\Database\Seeders\ToolSeeder::class);
        // Seed a CLI test user for automated checks
        $this->call(\Database\Seeders\TestUserSeeder::class);
    }
}
