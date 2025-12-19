<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create search logs table
        Schema::create('search_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('query');
            $table->enum('search_type', ['tools', 'comments', 'users', 'categories', 'all'])->default('all');
            $table->integer('results_count')->default(0);
            $table->float('response_time_ms')->default(0);
            $table->ipAddress('ip_address');
            $table->string('user_agent')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('user_id');
            $table->index('created_at');
            $table->fullText('query');
        });

        // Create search suggestions table
        Schema::create('search_suggestions', function (Blueprint $table) {
            $table->id();
            $table->string('keyword')->unique();
            $table->enum('type', ['tool', 'category', 'tag', 'user'])->default('tool');
            $table->integer('search_count')->default(1);
            $table->integer('click_count')->default(0);
            $table->float('popularity_score')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('popularity_score');
            $table->index('created_at');
            $table->fullText('keyword');
        });

        // Create search filters table
        Schema::create('search_filters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('filter_type', ['category', 'tag', 'date_range', 'rating', 'status'])->default('category');
            $table->json('options')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('filter_type');
            $table->index('is_active');
        });

        // Add full-text indexes to existing tables
        Schema::table('tools', function (Blueprint $table) {
            $table->fullText(['name', 'description']);
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->fullText('content');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->fullText(['name', 'bio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_filters');
        Schema::dropIfExists('search_suggestions');
        Schema::dropIfExists('search_logs');

        // Drop full-text indexes
        Schema::table('tools', function (Blueprint $table) {
            $table->dropFullText(['name', 'description']);
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropFullText('content');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropFullText(['name', 'bio']);
        });
    }
};
