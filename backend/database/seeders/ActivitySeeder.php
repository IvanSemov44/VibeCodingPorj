<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivitySeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $rows = [
            [
                'subject_type' => 'App\\Models\\Tool',
                'subject_id' => 1,
                'action' => 'created',
                'user_id' => 1,
                'meta' => json_encode(['id' => 1, 'name' => 'Example Tool', 'slug' => 'example-tool']),
                'created_at' => $now->subMinutes(10)->toDateTimeString(),
            ],
            [
                'subject_type' => 'App\\Models\\User',
                'subject_id' => 2,
                'action' => 'updated',
                'user_id' => 1,
                'meta' => json_encode(['id' => 2, 'name' => 'Test User', 'email' => 'test@example.com']),
                'created_at' => $now->subMinutes(8)->toDateTimeString(),
            ],
            [
                'subject_type' => 'App\\Models\\Tool',
                'subject_id' => 3,
                'action' => 'roles_updated',
                'user_id' => 1,
                'meta' => json_encode(['roles' => ['qa']]),
                'created_at' => $now->subMinutes(5)->toDateTimeString(),
            ],
        ];

        foreach ($rows as $row) {
            DB::table('activities')->insert(array_merge($row, ['created_at' => $row['created_at']]));
        }
    }
}
