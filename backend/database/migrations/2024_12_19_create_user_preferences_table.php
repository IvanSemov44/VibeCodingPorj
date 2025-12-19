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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->onDelete('cascade');
            
            // Privacy Settings
            $table->enum('privacy_level', ['public', 'private', 'friends_only'])
                ->default('public')
                ->comment('User profile visibility level');
            $table->boolean('show_email')
                ->default(false)
                ->comment('Whether to publicly show email');
            $table->boolean('show_activity')
                ->default(true)
                ->comment('Whether to publicly show activity');
            
            // Theme & Display
            $table->enum('theme', ['light', 'dark', 'system'])
                ->default('system')
                ->comment('UI theme preference');
            $table->enum('language', ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'])
                ->default('en')
                ->comment('Preferred language');
            $table->integer('items_per_page')
                ->default(20)
                ->comment('Default pagination limit');
            
            // Notification Settings
            $table->enum('email_digest_frequency', ['off', 'daily', 'weekly', 'monthly'])
                ->default('weekly')
                ->comment('Email digest frequency');
            $table->boolean('email_on_comment')
                ->default(true)
                ->comment('Send email when someone comments');
            $table->boolean('email_on_mention')
                ->default(true)
                ->comment('Send email when mentioned');
            $table->boolean('email_on_rating')
                ->default(true)
                ->comment('Send email when tool is rated');
            $table->boolean('email_marketing')
                ->default(true)
                ->comment('Receive marketing emails');
            
            // Tool Preferences
            $table->boolean('enable_api_access')
                ->default(false)
                ->comment('Allow API token access');
            $table->boolean('enable_webhooks')
                ->default(false)
                ->comment('Allow webhook integrations');
            
            // Search & Discovery
            $table->boolean('personalized_recommendations')
                ->default(true)
                ->comment('Receive personalized recommendations');
            $table->json('saved_filters')
                ->nullable()
                ->comment('User-saved search filters');
            
            // Accessibility
            $table->boolean('high_contrast_mode')
                ->default(false)
                ->comment('Enable high contrast mode');
            $table->boolean('reduce_motion')
                ->default(false)
                ->comment('Reduce animation effects');
            $table->boolean('large_text_mode')
                ->default(false)
                ->comment('Enable larger text sizes');
            
            // Account Settings
            $table->boolean('two_factor_enabled')
                ->default(false)
                ->comment('Two-factor authentication enabled');
            $table->string('timezone')
                ->default('UTC')
                ->comment('User timezone');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('privacy_level');
            $table->index('theme');
            $table->index('language');
            $table->index('email_digest_frequency');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
