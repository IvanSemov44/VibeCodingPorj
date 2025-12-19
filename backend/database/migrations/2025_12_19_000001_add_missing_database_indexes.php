<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to comments table
        Schema::table('comments', function (Blueprint $table) {
            // Check if indexes don't already exist before adding
            if (!$this->indexExists('comments', 'idx_comments_tool_created')) {
                $table->index(['tool_id', 'created_at'], 'idx_comments_tool_created');
            }

            if (!$this->indexExists('comments', 'idx_comments_user_created')) {
                $table->index(['user_id', 'created_at'], 'idx_comments_user_created');
            }

            if (!$this->indexExists('comments', 'idx_comments_moderated')) {
                $table->index('is_moderated');
            }
        });

        // Add indexes to ratings table
        Schema::table('ratings', function (Blueprint $table) {
            if (!$this->indexExists('ratings', 'idx_ratings_tool_user')) {
                $table->index(['tool_id', 'user_id'], 'idx_ratings_tool_user');
            }
        });

        // Add indexes to activities table
        Schema::table('activity_log', function (Blueprint $table) {
            if (!$this->indexExists('activity_log', 'idx_activity_causer')) {
                $table->index(['causer_type', 'causer_id'], 'idx_activity_causer');
            }

            if (!$this->indexExists('activity_log', 'idx_activity_subject')) {
                $table->index(['subject_type', 'subject_id'], 'idx_activity_subject');
            }

            if (!$this->indexExists('activity_log', 'idx_activity_created')) {
                $table->index('created_at', 'idx_activity_created');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            if ($this->indexExists('comments', 'idx_comments_tool_created')) {
                $table->dropIndex('idx_comments_tool_created');
            }

            if ($this->indexExists('comments', 'idx_comments_user_created')) {
                $table->dropIndex('idx_comments_user_created');
            }

            if ($this->indexExists('comments', 'idx_comments_moderated')) {
                $table->dropIndex('idx_comments_moderated');
            }
        });

        Schema::table('ratings', function (Blueprint $table) {
            if ($this->indexExists('ratings', 'idx_ratings_tool_user')) {
                $table->dropIndex('idx_ratings_tool_user');
            }
        });

        Schema::table('activity_log', function (Blueprint $table) {
            if ($this->indexExists('activity_log', 'idx_activity_causer')) {
                $table->dropIndex('idx_activity_causer');
            }

            if ($this->indexExists('activity_log', 'idx_activity_subject')) {
                $table->dropIndex('idx_activity_subject');
            }

            if ($this->indexExists('activity_log', 'idx_activity_created')) {
                $table->dropIndex('idx_activity_created');
            }
        });
    }

    /**
     * Check if an index exists on a table.
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $indexList = \DB::select("SHOW INDEX FROM {$table}");
        return collect($indexList)->pluck('Key_name')->contains($indexName);
    }
};
