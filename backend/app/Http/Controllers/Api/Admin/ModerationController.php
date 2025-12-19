<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Models\ContentReport;
use App\Models\ModerationAction;
use App\Models\ModerationAppeal;
use App\Models\User;
use App\Services\ModerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ModerationController extends Controller
{
    public function __construct(private ModerationService $moderationService)
    {
    }

    /**
     * Submit content report
     */
    public function reportContent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reportable_type' => 'required|string|in:Tool,Comment,ToolReview',
            'reportable_id' => 'required|integer',
            'reason' => 'required|string|in:spam,harassment,hate_speech,inappropriate_content,misinformation,copyright_violation,scam,violent_content,explicit_content,other',
            'description' => 'nullable|string|max:1000',
            'reported_user_id' => 'nullable|integer|exists:users,id',
        ]);

        $report = $this->moderationService->createReport(
            reporter: auth()->user(),
            reportableType: $validated['reportable_type'],
            reportableId: $validated['reportable_id'],
            reason: $validated['reason'],
            description: $validated['description'],
            reportedUser: isset($validated['reported_user_id'])
                ? User::find($validated['reported_user_id'])
                : null
        );

        return response()->json(['data' => $report], 201);
    }

    /**
     * Get reports for admin
     */
    public function getReports(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'status' => 'nullable|string|in:pending,under_review,resolved,dismissed',
            'reason' => 'nullable|string',
            'user_id' => 'nullable|integer|exists:users,id',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $reports = $this->moderationService->getReports(
            status: $validated['status'] ?? null,
            reason: $validated['reason'] ?? null,
            userId: $validated['user_id'] ?? null,
            limit: $validated['limit'] ?? 50
        );

        return response()->json(['data' => $reports, 'count' => $reports->count()]);
    }

    /**
     * Get pending reports
     */
    public function getPendingReports(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $reports = $this->moderationService->getPendingReports(
            priority: $validated['priority'] ?? null,
            limit: $validated['limit'] ?? 50
        );

        return response()->json(['data' => $reports, 'count' => $reports->count()]);
    }

    /**
     * Assign report to moderator
     */
    public function assignReport(Request $request, ContentReport $report): JsonResponse
    {
        $this->authorize('admin');

        $this->moderationService->assignReport($report, auth()->user());

        return response()->json(['data' => $report->fresh()]);
    }

    /**
     * Make moderation decision
     */
    public function makeDecision(Request $request, ContentReport $report): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'decision' => 'required|string|in:approve_action,reject_report,escalate',
            'reasoning' => 'required|string|max:1000',
            'appealable' => 'nullable|boolean',
        ]);

        $decision = $this->moderationService->makeDecision(
            report: $report,
            moderator: auth()->user(),
            decision: $validated['decision'],
            reasoning: $validated['reasoning'],
            appealable: $validated['appealable'] ?? true
        );

        return response()->json(['data' => $decision], 201);
    }

    /**
     * Remove content
     */
    public function removeContent(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'content_type' => 'required|string',
            'content_id' => 'required|integer',
            'reason' => 'required|string|max:500',
            'report_id' => 'nullable|integer|exists:content_reports,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $report = isset($validated['report_id'])
            ? ContentReport::find($validated['report_id'])
            : null;

        $action = $this->moderationService->removeContent(
            moderator: auth()->user(),
            contentType: $validated['content_type'],
            contentId: $validated['content_id'],
            reason: $validated['reason'],
            report: $report,
            notes: $validated['notes'] ?? null
        );

        return response()->json(['data' => $action], 201);
    }

    /**
     * Hide content
     */
    public function hideContent(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'content_type' => 'required|string',
            'content_id' => 'required|integer',
            'reason' => 'required|string|max:500',
            'report_id' => 'nullable|integer|exists:content_reports,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $report = isset($validated['report_id'])
            ? ContentReport::find($validated['report_id'])
            : null;

        $action = $this->moderationService->hideContent(
            moderator: auth()->user(),
            contentType: $validated['content_type'],
            contentId: $validated['content_id'],
            reason: $validated['reason'],
            report: $report,
            notes: $validated['notes'] ?? null
        );

        return response()->json(['data' => $action], 201);
    }

    /**
     * Warn user
     */
    public function warnUser(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'reason' => 'required|string|max:500',
            'report_id' => 'nullable|integer|exists:content_reports,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = User::find($validated['user_id']);
        $report = isset($validated['report_id'])
            ? ContentReport::find($validated['report_id'])
            : null;

        $action = $this->moderationService->warnUser(
            moderator: auth()->user(),
            targetUser: $user,
            reason: $validated['reason'],
            report: $report,
            notes: $validated['notes'] ?? null
        );

        return response()->json(['data' => $action], 201);
    }

    /**
     * Suspend user
     */
    public function suspendUser(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'duration_days' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
            'report_id' => 'nullable|integer|exists:content_reports,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = User::find($validated['user_id']);
        $report = isset($validated['report_id'])
            ? ContentReport::find($validated['report_id'])
            : null;

        $action = $this->moderationService->suspendUser(
            moderator: auth()->user(),
            targetUser: $user,
            durationDays: $validated['duration_days'],
            reason: $validated['reason'],
            report: $report,
            notes: $validated['notes'] ?? null
        );

        return response()->json(['data' => $action], 201);
    }

    /**
     * Ban user
     */
    public function banUser(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'reason' => 'required|string|max:500',
            'report_id' => 'nullable|integer|exists:content_reports,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = User::find($validated['user_id']);
        $report = isset($validated['report_id'])
            ? ContentReport::find($validated['report_id'])
            : null;

        $action = $this->moderationService->banUser(
            moderator: auth()->user(),
            targetUser: $user,
            reason: $validated['reason'],
            report: $report,
            notes: $validated['notes'] ?? null
        );

        return response()->json(['data' => $action], 201);
    }

    /**
     * Restore user
     */
    public function restoreUser(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = User::find($validated['user_id']);

        $action = $this->moderationService->restoreUser(
            moderator: auth()->user(),
            targetUser: $user,
            reason: $validated['reason'],
            notes: $validated['notes'] ?? null
        );

        return response()->json(['data' => $action], 201);
    }

    /**
     * Get user moderation status
     */
    public function getUserStatus(User $user): JsonResponse
    {
        $this->authorize('admin');

        $status = $this->moderationService->getUserStatus($user);

        return response()->json(['data' => $status]);
    }

    /**
     * Get user moderation actions
     */
    public function getUserActions(User $user, Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $actions = $this->moderationService->getUserActions($user, $validated['limit'] ?? 50);

        return response()->json(['data' => $actions, 'count' => $actions->count()]);
    }

    /**
     * Create appeal
     */
    public function createAppeal(Request $request, ModerationAction $action): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $appeal = $this->moderationService->createAppeal(
            user: auth()->user(),
            action: $action,
            reason: $validated['reason']
        );

        return response()->json(['data' => $appeal], 201);
    }

    /**
     * Get pending appeals
     */
    public function getPendingAppeals(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $appeals = $this->moderationService->getPendingAppeals($validated['limit'] ?? 50);

        return response()->json(['data' => $appeals, 'count' => $appeals->count()]);
    }

    /**
     * Approve appeal
     */
    public function approveAppeal(Request $request, ModerationAppeal $appeal): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $this->moderationService->approveAppeal(
            appeal: $appeal,
            reviewer: auth()->user(),
            notes: $validated['notes'] ?? ''
        );

        return response()->json(['data' => $appeal->fresh()]);
    }

    /**
     * Reject appeal
     */
    public function rejectAppeal(Request $request, ModerationAppeal $appeal): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $this->moderationService->rejectAppeal(
            appeal: $appeal,
            reviewer: auth()->user(),
            notes: $validated['notes'] ?? ''
        );

        return response()->json(['data' => $appeal->fresh()]);
    }

    /**
     * Get moderation statistics
     */
    public function getStatistics(): JsonResponse
    {
        $this->authorize('admin');

        $statistics = $this->moderationService->getStatistics();

        return response()->json(['data' => $statistics]);
    }

    /**
     * Get moderation queue
     */
    public function getQueue(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $queue = $this->moderationService->getQueue(
            priority: $validated['priority'] ?? null,
            assignedTo: $validated['assigned_to'] ?? null,
            limit: $validated['limit'] ?? 50
        );

        return response()->json(['data' => $queue, 'count' => $queue->count()]);
    }
}
