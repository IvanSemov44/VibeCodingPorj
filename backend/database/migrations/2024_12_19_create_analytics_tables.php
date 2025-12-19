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
        Schema::create('analytics_page_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('User who viewed, null for anonymous');
            $table->foreignId('tool_id')
                ->nullable()
                ->constrained('tools')
                ->onDelete('cascade')
                ->comment('Tool viewed, null for other pages');
            $table->string('page_path')->comment('URL path');
            $table->string('referrer')->nullable()->comment('Referrer URL');
            $table->string('user_agent')->nullable()->comment('Browser user agent');
            $table->string('ip_address')->nullable()->comment('IP address');
            $table->integer('response_time_ms')->default(0)->comment('Page load time');
            $table->timestamps();

            $table->index('user_id');
            $table->index('tool_id');
            $table->index('page_path');
            $table->index('created_at');
            $table->index(['tool_id', 'created_at']);
        });

        Schema::create('analytics_user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('User who performed action');
            $table->enum('activity_type', [
                'tool_view',
                'tool_create',
                'tool_update',
                'tool_delete',
                'comment_create',
                'comment_update',
                'rating_create',
                'rating_update',
                'favorite_add',
                'favorite_remove',
                'login',
                'logout',
                'profile_update',
                'settings_update',
            ])->comment('Type of activity');
            $table->foreignId('tool_id')
                ->nullable()
                ->constrained('tools')
                ->onDelete('cascade')
                ->comment('Related tool if applicable');
            $table->json('activity_data')->nullable()->comment('Additional activity details');
            $table->timestamps();

            $table->index('user_id');
            $table->index('activity_type');
            $table->index('tool_id');
            $table->index('created_at');
        });

        Schema::create('analytics_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_name')->comment('Name of metric (tools_created, comments_posted, etc)');
            $table->string('metric_type')->comment('Type: total, daily, weekly, monthly');
            $table->integer('value')->default(0)->comment('Metric value');
            $table->date('date')->comment('Date this metric applies to');
            $table->json('metadata')->nullable()->comment('Additional metadata');
            $table->timestamps();

            $table->unique(['metric_name', 'metric_type', 'date']);
            $table->index('metric_name');
            $table->index('date');
        });

        Schema::create('analytics_trending', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')
                ->constrained('tools')
                ->onDelete('cascade')
                ->comment('Tool being tracked');
            $table->integer('view_count')->default(0)->comment('View count in period');
            $table->integer('comment_count')->default(0)->comment('Comment count in period');
            $table->integer('rating_count')->default(0)->comment('Rating count in period');
            $table->float('average_rating')->default(0)->comment('Average rating in period');
            $table->float('trend_score')->default(0)->comment('Calculated trend score');
            $table->string('period')->comment('Period: hourly, daily, weekly, monthly');
            $table->date('date')->comment('Date this trend applies to');
            $table->timestamps();

            $table->unique(['tool_id', 'period', 'date']);
            $table->index('tool_id');
            $table->index('trend_score');
            $table->index('date');
        });

        Schema::create('analytics_category_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->constrained('categories')
                ->onDelete('cascade')
                ->comment('Category being tracked');
            $table->integer('tool_count')->default(0)->comment('Number of tools in category');
            $table->integer('total_views')->default(0)->comment('Total views of all tools');
            $table->integer('total_comments')->default(0)->comment('Total comments on tools');
            $table->integer('total_ratings')->default(0)->comment('Total ratings on tools');
            $table->float('average_rating')->default(0)->comment('Average rating in category');
            $table->string('period')->comment('Period: daily, weekly, monthly');
            $table->date('date')->comment('Date this stat applies to');
            $table->timestamps();

            $table->unique(['category_id', 'period', 'date']);
            $table->index('category_id');
            $table->index('date');
        });

        Schema::create('analytics_user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('User being tracked');
            $table->integer('tools_created')->default(0)->comment('Number of tools created');
            $table->integer('comments_posted')->default(0)->comment('Number of comments posted');
            $table->integer('ratings_given')->default(0)->comment('Number of ratings given');
            $table->integer('tools_viewed')->default(0)->comment('Number of tools viewed');
            $table->integer('login_count')->default(0)->comment('Number of logins');
            $table->integer('page_views')->default(0)->comment('Total page views');
            $table->integer('activity_score')->default(0)->comment('Overall activity score');
            $table->string('period')->comment('Period: daily, weekly, monthly');
            $table->date('date')->comment('Date this stat applies to');
            $table->timestamps();

            $table->unique(['user_id', 'period', 'date']);
            $table->index('user_id');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_user_stats');
        Schema::dropIfExists('analytics_category_stats');
        Schema::dropIfExists('analytics_trending');
        Schema::dropIfExists('analytics_metrics');
        Schema::dropIfExists('analytics_user_activities');
        Schema::dropIfExists('analytics_page_views');
    }
};
