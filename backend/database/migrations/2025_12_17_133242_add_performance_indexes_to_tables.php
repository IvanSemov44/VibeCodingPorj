<?php

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
        // Add indexes to tools table for better query performance
        Schema::table('tools', function (Blueprint $table) {
            $table->index('status', 'tools_status_idx');
            $table->index('created_at', 'tools_created_at_idx');
            $table->index(['status', 'created_at'], 'tools_status_created_at_idx');
            $table->index('submitted_by', 'tools_submitted_by_idx');
        });

        // Add indexes to users table
        Schema::table('users', function (Blueprint $table) {
            $table->index('is_active', 'users_is_active_idx');
        });

        // Add indexes to categories and tags for better relation lookups
        Schema::table('categories', function (Blueprint $table) {
            $table->index('slug', 'categories_slug_idx');
        });

        Schema::table('tags', function (Blueprint $table) {
            $table->index('slug', 'tags_slug_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropIndex('tools_status_idx');
            $table->dropIndex('tools_created_at_idx');
            $table->dropIndex('tools_status_created_at_idx');
            $table->dropIndex('tools_submitted_by_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_is_active_idx');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_slug_idx');
        });

        Schema::table('tags', function (Blueprint $table) {
            $table->dropIndex('tags_slug_idx');
        });
    }
};
