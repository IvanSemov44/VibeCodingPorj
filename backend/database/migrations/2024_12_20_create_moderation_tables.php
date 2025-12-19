<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Content reports for flagging inappropriate content
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('User submitting report');
            $table->unsignedBigInteger('reported_user_id')->nullable()->comment('User being reported');
            $table->string('reportable_type')->comment('Type of content (Tool, Comment, ToolReview)');
            $table->unsignedBigInteger('reportable_id')->comment('ID of reported content');
            $table->enum('reason', [
                'spam',
                'harassment',
                'hate_speech',
                'inappropriate_content',
                'misinformation',
                'copyright_violation',
                'scam',
                'violent_content',
                'explicit_content',
                'other'
            ])->comment('Reason for report');
            $table->text('description')->nullable()->comment('Detailed report description');
            $table->enum('status', [
                'pending',
                'under_review',
                'resolved',
                'dismissed'
            ])->default('pending')->comment('Report status');
            $table->timestamps();

            $table->index('user_id');
            $table->index('reported_user_id');
            $table->index(['reportable_type', 'reportable_id']);
            $table->index('reason');
            $table->index('status');
            $table->index('created_at');
        });

        // Moderation actions taken on content/users
        Schema::create('moderation_actions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('moderator_id')->comment('Admin who took action');
            $table->unsignedBigInteger('report_id')->nullable()->comment('Related report');
            $table->unsignedBigInteger('user_id')->nullable()->comment('User being actioned');
            $table->string('actionable_type')->nullable()->comment('Type of content');
            $table->unsignedBigInteger('actionable_id')->nullable()->comment('ID of content');
            $table->enum('action', [
                'content_remove',
                'content_hide',
                'user_warn',
                'user_suspend',
                'user_ban',
                'user_restore'
            ])->comment('Type of moderation action');
            $table->text('reason')->comment('Reason for action');
            $table->integer('duration_days')->nullable()->comment('Duration for suspend (null = permanent)');
            $table->text('notes')->nullable()->comment('Internal notes');
            $table->timestamps();

            $table->foreign('moderator_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('report_id')->references('id')->on('content_reports')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('moderator_id');
            $table->index('report_id');
            $table->index('user_id');
            $table->index(['actionable_type', 'actionable_id']);
            $table->index('action');
            $table->index('created_at');
        });

        // User moderation history and status
        Schema::create('user_moderation_status', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique()->comment('User being moderated');
            $table->boolean('is_suspended')->default(false)->comment('Account suspended');
            $table->boolean('is_banned')->default(false)->comment('Account banned');
            $table->date('suspension_ends_at')->nullable()->comment('When suspension ends');
            $table->integer('warning_count')->default(0)->comment('Number of warnings');
            $table->text('suspension_reason')->nullable()->comment('Why suspended');
            $table->text('ban_reason')->nullable()->comment('Why banned');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('is_suspended');
            $table->index('is_banned');
            $table->index('suspension_ends_at');
        });

        // Moderation queue for review
        Schema::create('moderation_queue', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('report_id');
            $table->unsignedBigInteger('assigned_to')->nullable()->comment('Assigned moderator');
            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'urgent'
            ])->default('medium')->comment('Report priority');
            $table->dateTime('assigned_at')->nullable();
            $table->timestamps();

            $table->foreign('report_id')->references('id')->on('content_reports')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->index('assigned_to');
            $table->index('priority');
            $table->index('created_at');
        });

        // Moderation decisions and appeals
        Schema::create('moderation_decisions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('report_id');
            $table->unsignedBigInteger('moderator_id');
            $table->enum('decision', [
                'approve_action',
                'reject_report',
                'escalate'
            ])->comment('Decision on report');
            $table->text('reasoning')->comment('Why this decision');
            $table->boolean('appealable')->default(true)->comment('Can be appealed');
            $table->timestamps();

            $table->foreign('report_id')->references('id')->on('content_reports')->onDelete('cascade');
            $table->foreign('moderator_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('moderator_id');
            $table->index('decision');
            $table->index('created_at');
        });

        // Moderation appeals
        Schema::create('moderation_appeals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('moderation_action_id');
            $table->text('reason')->comment('Appeal reason');
            $table->enum('status', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending')->comment('Appeal status');
            $table->unsignedBigInteger('reviewed_by')->nullable()->comment('Reviewer');
            $table->text('review_notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('moderation_action_id')->references('id')->on('moderation_actions')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_appeals');
        Schema::dropIfExists('moderation_decisions');
        Schema::dropIfExists('moderation_queue');
        Schema::dropIfExists('user_moderation_status');
        Schema::dropIfExists('moderation_actions');
        Schema::dropIfExists('content_reports');
    }
};
