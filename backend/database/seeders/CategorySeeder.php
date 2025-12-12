<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Model Hubs',
            'Inference APIs',
            'Prompting Tools',
            'Data Labeling',
            'Visualization',
            'Monitoring',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate([
                'name' => $name,
            ], [
                'slug' => Str::slug($name),
            ]);
        }
    }
}
