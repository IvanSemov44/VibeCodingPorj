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
            [
                'name' => 'Development Tools',
                'description' => 'Code editors, IDEs, and development utilities for building applications',
            ],
            [
                'name' => 'AI & Machine Learning',
                'description' => 'Tools for training, deploying, and managing AI models and ML workflows',
            ],
            [
                'name' => 'Model Hubs',
                'description' => 'Platforms hosting pre-trained models for various AI tasks',
            ],
            [
                'name' => 'Inference APIs',
                'description' => 'APIs for running predictions and inference on AI models',
            ],
            [
                'name' => 'Prompting Tools',
                'description' => 'Tools for crafting, testing, and optimizing prompts for LLMs',
            ],
            [
                'name' => 'Data Labeling',
                'description' => 'Platforms for annotating and labeling training data',
            ],
            [
                'name' => 'Visualization',
                'description' => 'Tools for visualizing data, models, and ML experiments',
            ],
            [
                'name' => 'Monitoring & Observability',
                'description' => 'Tools for monitoring model performance and system health',
            ],
            [
                'name' => 'Productivity',
                'description' => 'Tools to boost developer and team productivity',
            ],
            [
                'name' => 'DevOps & Infrastructure',
                'description' => 'CI/CD, deployment, and infrastructure management tools',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate([
                'name' => $category['name'],
            ], [
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
            ]);
        }
    }
}
