# Controller Implementation Guide

**Purpose**: Step-by-step blueprint for creating all remaining API controllers  
**Estimated Time**: 6-8 hours  
**Files to Create**: 6 controllers + 6 resources + 5 request classes

---

## Overview

This guide shows the exact structure for each controller, request class, and resource to match the existing architecture.

---

## 1. CommentController

### Location
`app/Http/Controllers/Api/CommentController.php`

### Structure
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CommentData;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Requests\ModerateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Tool;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class CommentController
{
    public function __construct(
        private CommentService $service,
    ) {}

    /**
     * Store a newly created comment.
     *
     * @param Tool $tool
     * @param StoreCommentRequest $request
     * @return JsonResponse
     */
    public function store(
        Tool $tool,
        StoreCommentRequest $request
    ): JsonResponse {
        $this->authorize('create', Comment::class);

        $data = CommentData::fromRequest(array_merge(
            $request->validated(),
            ['tool_id' => $tool->id]
        ));

        $comment = $this->service->create($data, auth()->user());

        return response()->json(
            new CommentResource($comment->load('user')),
            201
        );
    }

    /**
     * Display all comments for a tool.
     *
     * @param Tool $tool
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(
        Tool $tool,
        Request $request
    ): AnonymousResourceCollection {
        $comments = $tool->comments()
            ->approved()
            ->with('user', 'replies')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return CommentResource::collection($comments);
    }

    /**
     * Display the specified comment.
     *
     * @param Comment $comment
     * @return CommentResource
     */
    public function show(Comment $comment): CommentResource
    {
        $this->authorize('view', $comment);

        return new CommentResource(
            $comment->load('user', 'tool', 'replies')
        );
    }

    /**
     * Update the specified comment.
     *
     * @param Comment $comment
     * @param UpdateCommentRequest $request
     * @return CommentResource
     */
    public function update(
        Comment $comment,
        UpdateCommentRequest $request
    ): CommentResource {
        $this->authorize('update', $comment);

        $data = CommentData::fromRequest($request->validated());
        $updated = $this->service->create($data, auth()->user());

        return new CommentResource($updated);
    }

    /**
     * Delete the specified comment.
     *
     * @param Comment $comment
     * @return JsonResponse
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $this->service->delete($comment, auth()->user());

        return response()->json(null, 204);
    }

    /**
     * Moderate a comment (approve/reject).
     *
     * @param Comment $comment
     * @param ModerateCommentRequest $request
     * @return CommentResource
     */
    public function moderate(
        Comment $comment,
        ModerateCommentRequest $request
    ): CommentResource {
        $this->authorize('moderate', Comment::class);

        $approved = $request->boolean('approved');
        $moderated = $this->service->moderate(
            $comment,
            $approved,
            auth()->user()
        );

        return new CommentResource($moderated);
    }
}
```

---

## 2. RatingController

### Location
`app/Http/Controllers/Api/RatingController.php`

### Structure
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\RatingData;
use App\Http\Requests\StoreRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Rating;
use App\Models\Tool;
use App\Services\RatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class RatingController
{
    public function __construct(
        private RatingService $service,
    ) {}

    /**
     * Store a new rating or update existing.
     *
     * @param Tool $tool
     * @param StoreRatingRequest $request
     * @return JsonResponse
     */
    public function store(
        Tool $tool,
        StoreRatingRequest $request
    ): JsonResponse {
        $this->authorize('create', Rating::class);

        $data = RatingData::fromRequest(array_merge(
            $request->validated(),
            ['tool_id' => $tool->id, 'user_id' => auth()->id()]
        ));

        $rating = $this->service->create($data, auth()->user());

        return response()->json(
            new RatingResource($rating),
            201
        );
    }

    /**
     * Display all ratings for a tool.
     *
     * @param Tool $tool
     * @return AnonymousResourceCollection
     */
    public function index(Tool $tool): AnonymousResourceCollection
    {
        $ratings = $tool->ratings()
            ->with('user')
            ->latest()
            ->paginate(15);

        return RatingResource::collection($ratings);
    }

    /**
     * Display ratings summary.
     *
     * @param Tool $tool
     * @return JsonResponse
     */
    public function summary(Tool $tool): JsonResponse
    {
        $breakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];

        $ratings = $tool->ratings()
            ->selectRaw('score, COUNT(*) as count')
            ->groupBy('score')
            ->get();

        foreach ($ratings as $rating) {
            $breakdown[$rating->score] = $rating->count;
        }

        return response()->json([
            'average' => $tool->average_rating,
            'count' => $tool->ratings()->count(),
            'breakdown' => $breakdown,
        ]);
    }

    /**
     * Delete a rating.
     *
     * @param Rating $rating
     * @return JsonResponse
     */
    public function destroy(Rating $rating): JsonResponse
    {
        $this->authorize('delete', $rating);

        $this->service->delete($rating, auth()->user());

        return response()->json(null, 204);
    }
}
```

---

## 3. JournalController

### Location
`app/Http/Controllers/Api/JournalController.php`

### Structure
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\JournalEntryData;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Http\Resources\JournalEntryResource;
use App\Models\JournalEntry;
use App\Services\JournalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class JournalController
{
    public function __construct(
        private JournalService $service,
    ) {}

    /**
     * Store a new journal entry.
     *
     * @param StoreJournalRequest $request
     * @return JsonResponse
     */
    public function store(StoreJournalRequest $request): JsonResponse
    {
        $this->authorize('create', JournalEntry::class);

        $data = JournalEntryData::fromRequest(array_merge(
            $request->validated(),
            ['user_id' => auth()->id()]
        ));

        $entry = $this->service->create($data, auth()->user());

        return response()->json(
            new JournalEntryResource($entry),
            201
        );
    }

    /**
     * Display user's journal entries.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $entries = auth()->user()->journalEntries()
            ->when($request->input('mood'), fn($q) => 
                $q->where('mood', $request->input('mood'))
            )
            ->when($request->input('tag'), fn($q) => 
                $q->whereJsonContains('tags', $request->input('tag'))
            )
            ->latest()
            ->paginate($request->input('per_page', 15));

        return JournalEntryResource::collection($entries);
    }

    /**
     * Display the specified entry.
     *
     * @param JournalEntry $entry
     * @return JournalEntryResource
     */
    public function show(JournalEntry $entry): JournalEntryResource
    {
        $this->authorize('view', $entry);

        return new JournalEntryResource($entry);
    }

    /**
     * Update the specified entry.
     *
     * @param JournalEntry $entry
     * @param UpdateJournalRequest $request
     * @return JournalEntryResource
     */
    public function update(
        JournalEntry $entry,
        UpdateJournalRequest $request
    ): JournalEntryResource {
        $this->authorize('update', $entry);

        $data = JournalEntryData::fromRequest($request->validated());
        $updated = $this->service->update($entry, $data, auth()->user());

        return new JournalEntryResource($updated);
    }

    /**
     * Delete the specified entry.
     *
     * @param JournalEntry $entry
     * @return JsonResponse
     */
    public function destroy(JournalEntry $entry): JsonResponse
    {
        $this->authorize('delete', $entry);

        $this->service->delete($entry, auth()->user());

        return response()->json(null, 204);
    }

    /**
     * Get journal statistics.
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $entries = auth()->user()->journalEntries();

        return response()->json([
            'total_entries' => $entries->count(),
            'mood_breakdown' => [
                'happy' => $entries->where('mood', 'happy')->count(),
                'sad' => $entries->where('mood', 'sad')->count(),
                'neutral' => $entries->where('mood', 'neutral')->count(),
                'excited' => $entries->where('mood', 'excited')->count(),
                'angry' => $entries->where('mood', 'angry')->count(),
            ],
            'this_week' => $entries->where('created_at', '>=', now()->subWeek())->count(),
            'this_month' => $entries->where('created_at', '>=', now()->subMonth())->count(),
        ]);
    }
}
```

---

## 4. UserController (Admin)

### Location
`app/Http/Controllers/Api/Admin/UserController.php`

### Structure
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\DataTransferObjects\UserRoleData;
use App\Http\Requests\BanUserRequest;
use App\Http\Requests\SetUserRolesRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class UserController
{
    public function __construct(
        private UserService $service,
    ) {}

    /**
     * List all users with filters.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $users = User::when($request->input('role'), fn($q) => 
            $q->role($request->input('role'))
        )
        ->when($request->input('banned'), fn($q) => 
            $request->boolean('banned')
                ? $q->whereNotNull('banned_at')
                : $q->whereNull('banned_at')
        )
        ->latest()
        ->paginate($request->input('per_page', 15));

        return UserResource::collection($users);
    }

    /**
     * Ban a user.
     *
     * @param User $user
     * @param BanUserRequest $request
     * @return UserResource
     */
    public function ban(
        User $user,
        BanUserRequest $request
    ): UserResource {
        $this->authorize('ban', User::class);

        $reason = $request->input('reason');
        $banned = $this->service->ban($user, $reason, auth()->user());

        return new UserResource($banned);
    }

    /**
     * Unban a user.
     *
     * @param User $user
     * @return UserResource
     */
    public function unban(User $user): UserResource
    {
        $this->authorize('ban', User::class);

        $unbanned = $this->service->unban($user, auth()->user());

        return new UserResource($unbanned);
    }

    /**
     * Set user roles.
     *
     * @param User $user
     * @param SetUserRolesRequest $request
     * @return UserResource
     */
    public function setRoles(
        User $user,
        SetUserRolesRequest $request
    ): UserResource {
        $this->authorize('manageRoles', User::class);

        $data = UserRoleData::fromRequest(array_merge(
            $request->validated(),
            ['user_id' => $user->id]
        ));

        $updated = $this->service->setRoles($user, $data, auth()->user());

        return new UserResource($updated->load('roles'));
    }
}
```

---

## 5. AnalyticsController (Admin)

### Location
`app/Http/Controllers/Api/Admin/AnalyticsController.php`

### Structure
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Models\Tool;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AnalyticsController
{
    public function __construct(
        private AnalyticsService $service,
    ) {}

    /**
     * Get dashboard statistics.
     *
     * @return JsonResponse
     */
    public function dashboard(): JsonResponse
    {
        $this->authorize('viewAnalytics', User::class);

        $stats = $this->service->getDashboardStats();

        return response()->json($stats);
    }

    /**
     * Get tool analytics.
     *
     * @param Tool $tool
     * @return JsonResponse
     */
    public function toolAnalytics(Tool $tool): JsonResponse
    {
        $analytics = $this->service->getToolAnalytics($tool);

        return response()->json($analytics);
    }

    /**
     * Get engagement metrics over time.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function engagement(Request $request): JsonResponse
    {
        $this->authorize('viewAnalytics', User::class);

        $days = (int) $request->input('days', 7);
        $data = collect();

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);

            $data->push([
                'date' => $date->format('Y-m-d'),
                'views' => (int) DB::table('activity_log')
                    ->where('event', 'viewed')
                    ->whereDate('created_at', $date)
                    ->count(),
                'comments' => (int) DB::table('comments')
                    ->whereDate('created_at', $date)
                    ->count(),
                'ratings' => (int) DB::table('ratings')
                    ->whereDate('created_at', $date)
                    ->count(),
            ]);
        }

        return response()->json($data);
    }
}
```

---

## 6. ActivityController (Admin)

### Location
`app/Http/Controllers/Api/Admin/ActivityController.php`

### Structure
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ActivityController
{
    /**
     * Display activity log.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewActivityLog', User::class);

        $activities = Activity::query()
            ->when($request->input('causer_type'), fn($q) => 
                $q->where('causer_type', $request->input('causer_type'))
            )
            ->when($request->input('event'), fn($q) => 
                $q->where('event', $request->input('event'))
            )
            ->when($request->input('causer_id'), fn($q) => 
                $q->where('causer_id', $request->input('causer_id'))
            )
            ->with('causer', 'subject')
            ->latest()
            ->paginate($request->input('per_page', 20));

        return ActivityResource::collection($activities);
    }

    /**
     * Get activity for specific user.
     *
     * @param User $user
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function userActivity(
        User $user,
        Request $request
    ): AnonymousResourceCollection {
        $activities = Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->with('subject')
            ->latest()
            ->paginate($request->input('per_page', 20));

        return ActivityResource::collection($activities);
    }
}
```

---

## Request Validation Classes

### StoreCommentRequest
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:1', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Comment content is required',
            'content.max' => 'Comment cannot exceed 5000 characters',
            'parent_id.exists' => 'Parent comment does not exist',
        ];
    }
}
```

### StoreRatingRequest
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'integer', 'min:1', 'max:5'],
        ];
    }

    public function messages(): array
    {
        return [
            'score.required' => 'Rating score is required',
            'score.integer' => 'Rating must be a number',
            'score.min' => 'Rating must be at least 1',
            'score.max' => 'Rating cannot exceed 5',
        ];
    }
}
```

### StoreJournalRequest
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'min:10', 'max:10000'],
            'mood' => ['nullable', 'string', 'in:happy,sad,neutral,excited,angry'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
```

### BanUserRequest
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BanUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
```

### SetUserRolesRequest
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetUserRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
        ];
    }
}
```

---

## Resource Classes

### CommentResource
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tool_id' => $this->tool_id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'parent_id' => $this->parent_id,
            'is_moderated' => $this->is_moderated,
            'moderated_by' => $this->moderated_by,
            'user' => new UserResource($this->whenLoaded('user')),
            'replies_count' => $this->replies_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### RatingResource
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tool_id' => $this->tool_id,
            'user_id' => $this->user_id,
            'score' => $this->score,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Similar resources for JournalEntryResource, UserResource, ActivityResource...

---

## Route Registration

Add to `routes/api.php`:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Comments
    Route::post('/tools/{tool}/comments', [CommentController::class, 'store']);
    Route::get('/tools/{tool}/comments', [CommentController::class, 'index']);
    Route::get('/comments/{comment}', [CommentController::class, 'show']);
    Route::patch('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    
    // Ratings
    Route::post('/tools/{tool}/ratings', [RatingController::class, 'store']);
    Route::get('/tools/{tool}/ratings', [RatingController::class, 'index']);
    Route::get('/tools/{tool}/ratings/summary', [RatingController::class, 'summary']);
    Route::delete('/ratings/{rating}', [RatingController::class, 'destroy']);
    
    // Journal
    Route::prefix('journal')->group(function () {
        Route::post('/', [JournalController::class, 'store']);
        Route::get('/', [JournalController::class, 'index']);
        Route::get('/stats', [JournalController::class, 'stats']);
        Route::get('/{entry}', [JournalController::class, 'show']);
        Route::patch('/{entry}', [JournalController::class, 'update']);
        Route::delete('/{entry}', [JournalController::class, 'destroy']);
    });
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // User management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::patch('/{user}/ban', [UserController::class, 'ban']);
        Route::patch('/{user}/unban', [UserController::class, 'unban']);
        Route::patch('/{user}/roles', [UserController::class, 'setRoles']);
    });
    
    // Analytics
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/analytics/engagement', [AnalyticsController::class, 'engagement']);
    
    // Activity log
    Route::get('/activity-log', [ActivityController::class, 'index']);
    Route::get('/users/{user}/activity', [ActivityController::class, 'userActivity']);
    
    // Tool analytics
    Route::get('/tools/{tool}/analytics', [AnalyticsController::class, 'toolAnalytics']);
});
```

---

## Testing Controllers

Create tests in `tests/Feature/Http/Controllers/`:

```php
class CommentControllerTest extends TestCase
{
    use CreatesTools, CreatesUsers, RefreshDatabase;

    public function test_store_creates_comment(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();

        $response = $this->actingAs($user)
            ->postJson("/api/tools/{$tool->id}/comments", [
                'content' => 'Great tool!',
                'parent_id' => null,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'content', 'user']])
            ->assertJsonPath('data.content', 'Great tool!');
    }

    public function test_index_returns_comments(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        Comment::factory(5)->create(['tool_id' => $tool->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/tools/{$tool->id}/comments");

        $response->assertStatus(200)
            ->assertJsonPath('data', fn($data) => count($data) === 5);
    }
}
```

---

## Implementation Checklist

- [ ] Create CommentController + test
- [ ] Create RatingController + test
- [ ] Create JournalController + test
- [ ] Create UserController + test
- [ ] Create AnalyticsController + test
- [ ] Create ActivityController + test
- [ ] Create 6 Request classes
- [ ] Create 6 Resource classes
- [ ] Register all routes
- [ ] Test all endpoints
- [ ] Add API documentation

**Time Estimate**: 6-8 hours  
**Difficulty**: Medium (mostly copy/paste with slight modifications)

---

Next: Run tests and move to Phase 3 (Events/Listeners).

