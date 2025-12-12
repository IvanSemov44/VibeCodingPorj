<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration documents and acknowledges duplicate migrations that were already run.
     * The duplicate migrations (2025_12_11_* and 2025_12_12_*) created the same columns
     * with idempotent checks, so no data corruption occurred.
     *
     * Going forward, the older migrations (2025_12_11_*) should be removed from the
     * codebase to prevent confusion.
     */
    public function up(): void
    {
        // Log cleanup action for auditing (only if activity_log table exists)
        if (DB::getSchemaBuilder()->hasTable('activity_log')) {
            DB::table('activity_log')->insert([
                'event' => 'migration_cleanup',
                'log_name' => 'default',
                'description' => 'duplicate_migrations_acknowledged',
                'properties' => json_encode([
                    'action' => 'duplicate_migrations_acknowledged',
                    'note' => 'Duplicate migrations 2025_12_11_100000 and 2025_12_12_000001 (security fields) and 2025_12_11_100100 and 2025_12_12_000002 (activity logs) were both run but are idempotent.',
                    'recommendation' => 'Remove 2025_12_11_* migration files from codebase.',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nothing to reverse - this was a documentation migration
    }
};
