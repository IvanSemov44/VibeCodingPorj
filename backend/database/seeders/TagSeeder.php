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
            'nlp',
            'vision',
            'training',
            'deployment',
            'open-source',
            'paid',
        ];

        foreach ($tags as $name) {
            Tag::firstOrCreate([
                'name' => $name,
            ], [
                'slug' => Str::slug($name),
            ]);
        }
    }
}
