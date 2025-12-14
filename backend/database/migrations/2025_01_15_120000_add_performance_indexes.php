<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for frequently queried columns on tools table
        Schema::table('tools', function (Blueprint $table) {
            if (Schema::hasColumn('tools', 'slug') && ! $this->indexExists('tools', 'slug')) {
                $table->index('slug');
            }
            if (Schema::hasColumn('tools', 'category_id') && ! $this->indexExists('tools', 'category_id')) {
                $table->index('category_id');
            }
            if (Schema::hasColumn('tools', 'approved') && ! $this->indexExists('tools', 'approved')) {
                $table->index('approved');
            }
            if (Schema::hasColumn('tools', 'created_at') && ! $this->indexExists('tools', 'created_at')) {
                $table->index('created_at');
            }
        });

        // Add indexes for categories
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'slug') && ! $this->indexExists('categories', 'slug')) {
                $table->index('slug');
            }
        });

        // Add indexes for tags
        Schema::table('tags', function (Blueprint $table) {
            if (Schema::hasColumn('tags', 'slug') && ! $this->indexExists('tags', 'slug')) {
                $table->index('slug');
            }
        });

        // Add indexes for activity_log table (Spatie)
        if (Schema::hasTable('activity_log')) {
            Schema::table('activity_log', function (Blueprint $table) {
                if (Schema::hasColumn('activity_log', 'log_name') && ! $this->indexExists('activity_log', 'log_name')) {
                    $table->index('log_name');
                }
                if (Schema::hasColumn('activity_log', 'created_at') && ! $this->indexExists('activity_log', 'created_at')) {
                    $table->index('created_at');
                }
            });
        }

        // Add indexes for user lookup and authentication
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_active') && ! $this->indexExists('users', 'is_active')) {
                $table->index('is_active');
            }
            if (Schema::hasColumn('users', 'locked_until') && ! $this->indexExists('users', 'locked_until')) {
                $table->index('locked_until');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            if ($this->indexExists('tools', 'slug')) {
                $table->dropIndex(['slug']);
            }
            if ($this->indexExists('tools', 'category_id')) {
                $table->dropIndex(['category_id']);
            }
            if ($this->indexExists('tools', 'approved')) {
                $table->dropIndex(['approved']);
            }
            if ($this->indexExists('tools', 'created_at')) {
                $table->dropIndex(['created_at']);
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if ($this->indexExists('categories', 'slug')) {
                $table->dropIndex(['slug']);
            }
        });

        Schema::table('tags', function (Blueprint $table) {
            if ($this->indexExists('tags', 'slug')) {
                $table->dropIndex(['slug']);
            }
        });

        if (Schema::hasTable('activity_log')) {
            Schema::table('activity_log', function (Blueprint $table) {
                if ($this->indexExists('activity_log', 'log_name')) {
                    $table->dropIndex(['log_name']);
                }
                if ($this->indexExists('activity_log', 'created_at')) {
                    $table->dropIndex(['created_at']);
                }
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if ($this->indexExists('users', 'is_active')) {
                $table->dropIndex(['is_active']);
            }
            if ($this->indexExists('users', 'locked_until')) {
                $table->dropIndex(['locked_until']);
            }
        });
    }

    /**
     * Check if an index exists on a table.
     */
    private function indexExists(string $table, string $column): bool
    {
        $db = DB::selectOne('SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?', [$table, $column]);

        return $db && $db->cnt > 0;
    }
};
