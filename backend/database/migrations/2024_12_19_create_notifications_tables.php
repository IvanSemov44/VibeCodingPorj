<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // CommentCreated, ToolLiked, etc.
            $table->json('data'); // Notification payload
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('user_id');
            $table->index('type');
            $table->index('created_at');
            $table->index('read_at');
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('notification_type'); // CommentCreated, ToolLiked, etc.
            $table->boolean('email_enabled')->default(true);
            $table->boolean('in_app_enabled')->default(true);
            $table->boolean('push_enabled')->default(true);
            $table->timestamps();

            // Unique constraint: one preference per user per type
            $table->unique(['user_id', 'notification_type']);
            $table->index('user_id');
        });

        Schema::create('notification_activity_feeds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('activity_type', [
                'comment_created',
                'tool_liked',
                'tool_commented',
                'user_followed',
                'comment_replied',
            ]);
            $table->json('activity_data'); // Who, what, when
            $table->timestamp('created_at');

            // Indexes
            $table->index('user_id');
            $table->index('activity_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_activity_feeds');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notifications');
    }
};
