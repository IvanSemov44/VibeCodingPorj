<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ContentReport;
use App\Models\ModerationAction;
use App\Models\ModerationAppeal;
use App\Models\ModerationDecision;
use App\Models\ModerationQueue;
use App\Models\User;
use App\Models\UserModerationStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class ModerationService
{
    /**
     * Create a content report
     */
    public function createReport(
        User $reporter,
        string $reportableType,
        int $reportableId,
        string $reason,
        ?string $description = null,
        ?User $reportedUser = null
    ): ContentReport {
        $report = ContentReport::create([
            'user_id' => $reporter->id,
            'reported_user_id' => $reportedUser?->id,
            'reportable_type' => $reportableType,
            'reportable_id' => $reportableId,
            'reason' => $reason,
            'description' => $description,
            'status' => 'pending',
        ]);

        // Add to moderation queue with priority based on reason
        $priority = $this->getReportPriority($reason);
        ModerationQueue::create([
            'report_id' => $report->id,
            'priority' => $priority,
        ]);

        return $report;
    }

    /**
     * Get report priority based on reason
     */
    private function getReportPriority(string $reason): string
    {
        $urgentReasons = ['hate_speech', 'violent_content', 'explicit_content'];
        $highReasons = ['harassment', 'scam', 'copyright_violation'];

        if (in_array($reason, $urgentReasons)) {
            return 'urgent';
        }

        if (in_array($reason, $highReasons)) {
            return 'high';
        }

        return 'medium';
    }

    /**
     * Get pending reports for moderation
     */
    public function getPendingReports(
        ?string $priority = null,
        int $limit = 50
    ): Collection {
        $query = ContentReport::where('status', 'pending')
            ->with(['reporter', 'reportedUser', 'queueItem'])
            ->orderBy('created_at', 'asc');

        if ($priority) {
            $query->whereHas('queueItem', fn ($q) => $q->where('priority', $priority));
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get all reports with optional filtering
     */
    public function getReports(
        ?string $status = null,
        ?string $reason = null,
        ?int $userId = null,
        int $limit = 50
    ): Collection {
        $query = ContentReport::with(['reporter', 'reportedUser', 'decision']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($reason) {
            $query->where('reason', $reason);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->orderBy('created_at', 'desc')->limit($limit)->get();
    }

    /**
     * Assign report to moderator
     */
    public function assignReport(ContentReport $report, User $moderator): void
    {
        $queueItem = $report->queueItem();

        if ($queueItem) {
            $queueItem->assign($moderator);
        }

        $report->update(['status' => 'under_review']);
    }

    /**
     * Create moderation decision
     */
    public function makeDecision(
        ContentReport $report,
        User $moderator,
        string $decision,
        string $reasoning,
        bool $appealable = true
    ): ModerationDecision {
        $decisionRecord = ModerationDecision::create([
            'report_id' => $report->id,
            'moderator_id' => $moderator->id,
            'decision' => $decision,
            'reasoning' => $reasoning,
            'appealable' => $appealable,
        ]);

        $report->update(['status' => 'resolved']);

        return $decisionRecord;
    }

    /**
     * Take moderation action on content
     */
    public function removeContent(
        User $moderator,
        string $contentType,
        int $contentId,
        string $reason,
        ?ContentReport $report = null,
        ?string $notes = null
    ): ModerationAction {
        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'report_id' => $report?->id,
            'actionable_type' => $contentType,
            'actionable_id' => $contentId,
            'action' => 'content_remove',
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }

    /**
     * Hide content instead of removing
     */
    public function hideContent(
        User $moderator,
        string $contentType,
        int $contentId,
        string $reason,
        ?ContentReport $report = null,
        ?string $notes = null
    ): ModerationAction {
        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'report_id' => $report?->id,
            'actionable_type' => $contentType,
            'actionable_id' => $contentId,
            'action' => 'content_hide',
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }

    /**
     * Issue warning to user
     */
    public function warnUser(
        User $moderator,
        User $targetUser,
        string $reason,
        ?ContentReport $report = null,
        ?string $notes = null
    ): ModerationAction {
        $status = UserModerationStatus::firstOrCreate(
            ['user_id' => $targetUser->id]
        );
        $status->incrementWarning();

        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'report_id' => $report?->id,
            'user_id' => $targetUser->id,
            'action' => 'user_warn',
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }

    /**
     * Suspend user for specified duration
     */
    public function suspendUser(
        User $moderator,
        User $targetUser,
        int $durationDays,
        string $reason,
        ?ContentReport $report = null,
        ?string $notes = null
    ): ModerationAction {
        $suspensionEnds = now()->addDays($durationDays);

        $status = UserModerationStatus::firstOrCreate(
            ['user_id' => $targetUser->id]
        );
        $status->update([
            'is_suspended' => true,
            'suspension_ends_at' => $suspensionEnds,
            'suspension_reason' => $reason,
        ]);

        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'report_id' => $report?->id,
            'user_id' => $targetUser->id,
            'action' => 'user_suspend',
            'reason' => $reason,
            'duration_days' => $durationDays,
            'notes' => $notes,
        ]);
    }

    /**
     * Ban user permanently
     */
    public function banUser(
        User $moderator,
        User $targetUser,
        string $reason,
        ?ContentReport $report = null,
        ?string $notes = null
    ): ModerationAction {
        $status = UserModerationStatus::firstOrCreate(
            ['user_id' => $targetUser->id]
        );
        $status->update([
            'is_banned' => true,
            'ban_reason' => $reason,
        ]);

        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'report_id' => $report?->id,
            'user_id' => $targetUser->id,
            'action' => 'user_ban',
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }

    /**
     * Restore suspended user
     */
    public function restoreUser(
        User $moderator,
        User $targetUser,
        string $reason,
        ?string $notes = null
    ): ModerationAction {
        $status = UserModerationStatus::firstOrCreate(
            ['user_id' => $targetUser->id]
        );
        $status->update([
            'is_suspended' => false,
            'is_banned' => false,
            'suspension_ends_at' => null,
        ]);
        $status->resetWarnings();

        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'user_id' => $targetUser->id,
            'action' => 'user_restore',
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }

    /**
     * Get moderation actions for user
     */
    public function getUserActions(User $user, int $limit = 50): Collection
    {
        return ModerationAction::where('user_id', $user->id)
            ->with(['moderator', 'report'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get moderation status for user
     */
    public function getUserStatus(User $user): ?UserModerationStatus
    {
        return UserModerationStatus::where('user_id', $user->id)->first();
    }

    /**
     * Create appeal for moderation action
     */
    public function createAppeal(
        User $user,
        ModerationAction $action,
        string $reason
    ): ModerationAppeal {
        return ModerationAppeal::create([
            'user_id' => $user->id,
            'moderation_action_id' => $action->id,
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }

    /**
     * Get pending appeals
     */
    public function getPendingAppeals(int $limit = 50): Collection
    {
        return ModerationAppeal::where('status', 'pending')
            ->with(['user', 'moderationAction', 'moderationAction.moderator'])
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Approve appeal
     */
    public function approveAppeal(
        ModerationAppeal $appeal,
        User $reviewer,
        string $notes = ''
    ): void {
        $appeal->approve($reviewer, $notes);

        // Optionally reverse moderation action here
        if ($appeal->moderationAction->isTemporary()) {
            $targetUser = $appeal->user;
            $this->restoreUser($reviewer, $targetUser, 'Appeal approved');
        }
    }

    /**
     * Reject appeal
     */
    public function rejectAppeal(
        ModerationAppeal $appeal,
        User $reviewer,
        string $notes = ''
    ): void {
        $appeal->reject($reviewer, $notes);
    }

    /**
     * Get moderation statistics
     */
    public function getStatistics(): array
    {
        return [
            'pending_reports' => ContentReport::where('status', 'pending')->count(),
            'under_review' => ContentReport::where('status', 'under_review')->count(),
            'resolved_reports' => ContentReport::where('status', 'resolved')->count(),
            'dismissed_reports' => ContentReport::where('status', 'dismissed')->count(),
            'total_actions' => ModerationAction::count(),
            'suspended_users' => UserModerationStatus::where('is_suspended', true)->count(),
            'banned_users' => UserModerationStatus::where('is_banned', true)->count(),
            'pending_appeals' => ModerationAppeal::where('status', 'pending')->count(),
            'approved_appeals' => ModerationAppeal::where('status', 'approved')->count(),
        ];
    }

    /**
     * Auto-resolve expired suspensions
     */
    public function processExpiredSuspensions(): int
    {
        $expiredCount = 0;

        UserModerationStatus::where('is_suspended', true)
            ->whereNotNull('suspension_ends_at')
            ->where('suspension_ends_at', '<=', now())
            ->get()
            ->each(function (UserModerationStatus $status) use (&$expiredCount) {
                $status->update(['is_suspended' => false]);
                $expiredCount++;
            });

        return $expiredCount;
    }

    /**
     * Get moderation queue
     */
    public function getQueue(
        ?string $priority = null,
        ?int $assignedTo = null,
        int $limit = 50
    ): Collection {
        $query = ModerationQueue::with(['report', 'assignee'])
            ->orderByRaw("CASE WHEN priority = 'urgent' THEN 0 WHEN priority = 'high' THEN 1 WHEN priority = 'medium' THEN 2 ELSE 3 END")
            ->orderBy('created_at', 'asc');

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($assignedTo) {
            $query->where('assigned_to', $assignedTo);
        }

        return $query->limit($limit)->get();
    }
}
