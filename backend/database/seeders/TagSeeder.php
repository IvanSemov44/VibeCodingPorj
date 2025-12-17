<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'NLP', 'description' => 'Natural Language Processing tools and models'],
            ['name' => 'Computer Vision', 'description' => 'Image and video processing tools'],
            ['name' => 'Training', 'description' => 'Model training and fine-tuning tools'],
            ['name' => 'Deployment', 'description' => 'Model deployment and serving platforms'],
            ['name' => 'Open Source', 'description' => 'Free and open-source tools'],
            ['name' => 'Commercial', 'description' => 'Paid and enterprise solutions'],
            ['name' => 'Cloud', 'description' => 'Cloud-based platforms and services'],
            ['name' => 'Local', 'description' => 'Tools that run locally on your machine'],
            ['name' => 'API', 'description' => 'API-based services and integrations'],
            ['name' => 'CLI', 'description' => 'Command-line interface tools'],
            ['name' => 'Web', 'description' => 'Web-based applications and platforms'],
            ['name' => 'Python', 'description' => 'Python-based tools and libraries'],
            ['name' => 'JavaScript', 'description' => 'JavaScript/TypeScript tools'],
            ['name' => 'Data Science', 'description' => 'Data analysis and visualization'],
            ['name' => 'LLM', 'description' => 'Large Language Model tools'],
            ['name' => 'Audio', 'description' => 'Speech and audio processing'],
            ['name' => 'Generative AI', 'description' => 'Content generation tools'],
            ['name' => 'AutoML', 'description' => 'Automated machine learning platforms'],
            ['name' => 'MLOps', 'description' => 'ML operations and lifecycle management'],
            ['name' => 'No-Code', 'description' => 'No-code/low-code solutions'],
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate(
                ['slug' => Str::slug($tag['name'])],
                [
                    'name' => $tag['name'],
                    'description' => $tag['description'],
                ]
            );
        }
    }
}
