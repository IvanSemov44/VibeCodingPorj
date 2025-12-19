# API Endpoint Planning Guide

**Purpose**: Provides a complete blueprint for API endpoint creation  
**Status**: Ready for implementation  
**Estimated Time**: 6-8 hours to create 20+ endpoints

---

## REST API Structure

All endpoints follow RESTful conventions with proper HTTP methods and status codes.

---

## 1. Comment Endpoints

### POST /api/tools/{tool}/comments
**Create a comment on a tool**

```php
// Route
Route::post('/tools/{tool}/comments', [CommentController::class, 'store'])->middleware('auth');

// Controller
public function store(
    Tool $tool,
    CommentRequest $request,
    CommentService $service
) {
    $this->authorize('create', Comment::class);
    
    $data = CommentData::fromRequest($request->validated());
    $comment = $service->create($data, auth()->user());
    
    return response()->json($comment->load('user'), 201);
}

// Request
POST /api/tools/1/comments
{
    "content": "Great tool!",
    "parent_id": null
}

// Response (201)
{
    "id": 1,
    "tool_id": 1,
    "user_id": 1,
    "content": "Great tool!",
    "parent_id": null,
    "is_moderated": null,
    "user": { "id": 1, "name": "John" },
    "created_at": "2025-12-19T10:00:00Z"
}
```

### GET /api/tools/{tool}/comments
**List all comments for a tool**

```php
// Controller
public function index(Tool $tool, Request $request)
{
    $comments = $tool->comments()
        ->approved()
        ->with('user', 'replies')
        ->latest()
        ->paginate($request->input('per_page', 15));
    
    return CommentResource::collection($comments);
}

// Response (200)
{
    "data": [
        {
            "id": 1,
            "content": "Great!",
            "user": { "id": 1, "name": "John" },
            "replies": []
        }
    ],
    "links": { ... },
    "meta": { "total": 42, "per_page": 15 }
}
```

### GET /api/comments/{comment}
**Get a specific comment**

```php
// Controller
public function show(Comment $comment)
{
    return new CommentResource($comment->load('user', 'tool', 'replies'));
}

// Response (200)
{
    "id": 1,
    "content": "Great tool!",
    "user": { ... },
    "tool": { ... },
    "replies": [ ... ]
}
```

### PATCH /api/comments/{comment}
**Update a comment** (Only by author)

```php
// Controller
public function update(Comment $comment, CommentRequest $request, CommentService $service)
{
    $this->authorize('update', $comment);
    
    $data = CommentData::fromRequest($request->validated());
    $updated = $service->create($data, auth()->user());  // Will update same comment
    
    return new CommentResource($updated);
}

// Request
PATCH /api/comments/1
{
    "content": "Updated comment"
}

// Response (200)
```

### DELETE /api/comments/{comment}
**Delete a comment**

```php
// Controller
public function destroy(Comment $comment, CommentService $service)
{
    $this->authorize('delete', $comment);
    
    $service->delete($comment, auth()->user());
    
    return response()->noContent();
}

// Response (204 No Content)
```

### POST /api/comments/{comment}/moderate
**Approve or reject a comment** (Admin only)

```php
// Controller
public function moderate(Comment $comment, ModerationRequest $request, CommentService $service)
{
    $this->authorize('moderate', Comment::class);
    
    $approved = $request->input('approved');
    $moderated = $service->moderate($comment, $approved, auth()->user());
    
    return new CommentResource($moderated);
}

// Request
POST /api/comments/1/moderate
{
    "approved": true
}

// Response (200)
{
    "id": 1,
    "is_moderated": true,
    "moderated_by": 2,
    "content": "Great!"
}
```

---

## 2. Rating Endpoints

### POST /api/tools/{tool}/ratings
**Rate a tool** (Creates or updates user's rating)

```php
// Controller
public function store(
    Tool $tool,
    RatingRequest $request,
    RatingService $service
) {
    $this->authorize('rate', Tool::class);
    
    $data = RatingData::fromRequest(array_merge(
        $request->validated(),
        ['tool_id' => $tool->id]
    ));
    
    $rating = $service->create($data, auth()->user());
    
    return response()->json($rating, 201);
}

// Request
POST /api/tools/1/ratings
{
    "score": 5
}

// Response (201 or 200)
{
    "id": 1,
    "tool_id": 1,
    "user_id": 1,
    "score": 5,
    "created_at": "2025-12-19T10:00:00Z",
    "updated_at": "2025-12-19T10:05:00Z"
}
```

### GET /api/tools/{tool}/ratings
**Get all ratings for a tool**

```php
// Controller
public function index(Tool $tool)
{
    $ratings = $tool->ratings()
        ->with('user')
        ->latest()
        ->paginate();
    
    return RatingResource::collection($ratings);
}

// Response (200)
{
    "data": [
        { "id": 1, "score": 5, "user": { ... } },
        { "id": 2, "score": 4, "user": { ... } }
    ],
    "meta": { "total": 25 }
}
```

### GET /api/tools/{tool}/ratings/summary
**Get ratings summary and breakdown**

```php
// Controller
public function summary(Tool $tool)
{
    return response()->json([
        'average' => $tool->average_rating,
        'count' => $tool->ratings()->count(),
        'breakdown' => [
            '1' => $tool->ratings()->where('score', 1)->count(),
            '2' => $tool->ratings()->where('score', 2)->count(),
            '3' => $tool->ratings()->where('score', 3)->count(),
            '4' => $tool->ratings()->where('score', 4)->count(),
            '5' => $tool->ratings()->where('score', 5)->count(),
        ]
    ]);
}

// Response (200)
{
    "average": 4.5,
    "count": 25,
    "breakdown": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 5,
        "5": 20
    }
}
```

### GET /api/users/{user}/rating/{tool}
**Get user's rating for a tool**

```php
// Controller
public function userRating(User $user, Tool $tool)
{
    $rating = Rating::where('user_id', $user->id)
        ->where('tool_id', $tool->id)
        ->first();
    
    if (!$rating) {
        return response()->json(['rating' => null], 200);
    }
    
    return new RatingResource($rating);
}

// Response (200)
{
    "id": 1,
    "score": 5
}
```

### DELETE /api/ratings/{rating}
**Delete a rating**

```php
// Controller
public function destroy(Rating $rating, RatingService $service)
{
    $this->authorize('delete', $rating);
    
    $service->delete($rating, auth()->user());
    
    return response()->noContent();
}

// Response (204 No Content)
```

---

## 3. Journal Endpoints

### POST /api/journal
**Create a journal entry**

```php
// Controller
public function store(JournalRequest $request, JournalService $service)
{
    $this->authorize('create', JournalEntry::class);
    
    $data = JournalEntryData::fromRequest(array_merge(
        $request->validated(),
        ['user_id' => auth()->id()]
    ));
    
    $entry = $service->create($data, auth()->user());
    
    return response()->json($entry, 201);
}

// Request
POST /api/journal
{
    "title": "Productive Day",
    "content": "Learned about Laravel architecture...",
    "mood": "happy",
    "tags": ["learning", "laravel"]
}

// Response (201)
{
    "id": 1,
    "user_id": 1,
    "title": "Productive Day",
    "content": "Learned about Laravel architecture...",
    "mood": "happy",
    "tags": ["learning", "laravel"],
    "created_at": "2025-12-19T10:00:00Z"
}
```

### GET /api/journal
**List user's journal entries**

```php
// Controller
public function index(Request $request, JournalService $service)
{
    $entries = auth()->user()->journalEntries()
        ->when($request->input('mood'), fn($q) => $q->where('mood', $request->input('mood')))
        ->when($request->input('tag'), fn($q) => $q->whereJsonContains('tags', $request->input('tag')))
        ->latest()
        ->paginate();
    
    return JournalResource::collection($entries);
}

// Query params
GET /api/journal?mood=happy&tag=learning&per_page=20

// Response (200)
{
    "data": [ ... ],
    "meta": { "total": 45 }
}
```

### GET /api/journal/{entry}
**Get a specific journal entry**

```php
// Controller
public function show(JournalEntry $entry)
{
    $this->authorize('view', $entry);
    
    return new JournalResource($entry);
}

// Response (200)
```

### PATCH /api/journal/{entry}
**Update a journal entry**

```php
// Controller
public function update(
    JournalEntry $entry,
    JournalRequest $request,
    JournalService $service
) {
    $this->authorize('update', $entry);
    
    $data = JournalEntryData::fromRequest($request->validated());
    $updated = $service->update($entry, $data, auth()->user());
    
    return new JournalResource($updated);
}

// Response (200)
```

### DELETE /api/journal/{entry}
**Delete a journal entry**

```php
// Controller
public function destroy(JournalEntry $entry, JournalService $service)
{
    $this->authorize('delete', $entry);
    
    $service->delete($entry, auth()->user());
    
    return response()->noContent();
}

// Response (204 No Content)
```

### GET /api/journal/stats
**Get journal statistics for user**

```php
// Controller
public function stats()
{
    $entries = auth()->user()->journalEntries();
    
    return response()->json([
        'total_entries' => $entries->count(),
        'mood_breakdown' => [
            'happy' => $entries->where('mood', 'happy')->count(),
            'sad' => $entries->where('mood', 'sad')->count(),
            'neutral' => $entries->where('mood', 'neutral')->count(),
        ],
        'this_week' => $entries->where('created_at', '>=', now()->subWeek())->count(),
        'this_month' => $entries->where('created_at', '>=', now()->subMonth())->count(),
    ]);
}

// Response (200)
```

---

## 4. User Management Endpoints

### PATCH /api/admin/users/{user}/ban
**Ban a user**

```php
// Controller
public function ban(User $user, Request $request, UserService $service)
{
    $this->authorize('ban', User::class);
    
    $reason = $request->input('reason');
    $banned = $service->ban($user, $reason, auth()->user());
    
    return new UserResource($banned);
}

// Request
PATCH /api/admin/users/1/ban
{
    "reason": "Violates community guidelines"
}

// Response (200)
```

### PATCH /api/admin/users/{user}/unban
**Unban a user**

```php
// Controller
public function unban(User $user, UserService $service)
{
    $this->authorize('ban', User::class);
    
    $unbanned = $service->unban($user, auth()->user());
    
    return new UserResource($unbanned);
}

// Response (200)
```

### PATCH /api/admin/users/{user}/roles
**Set user roles**

```php
// Controller
public function setRoles(User $user, Request $request, UserService $service)
{
    $this->authorize('manage-roles', User::class);
    
    $data = UserRoleData::fromRequest(array_merge(
        $request->validated(),
        ['user_id' => $user->id]
    ));
    
    $updated = $service->setRoles($user, $data, auth()->user());
    
    return new UserResource($updated->load('roles'));
}

// Request
PATCH /api/admin/users/1/roles
{
    "roles": ["editor", "reviewer"]
}

// Response (200)
{
    "id": 1,
    "name": "John Doe",
    "roles": [
        { "id": 1, "name": "editor" },
        { "id": 2, "name": "reviewer" }
    ]
}
```

### GET /api/admin/users
**List all users** (Admin only)

```php
// Controller
public function index(Request $request)
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
    ->paginate();
    
    return UserResource::collection($users);
}

// Response (200)
```

---

## 5. Analytics Endpoints

### GET /api/admin/analytics/dashboard
**Get dashboard statistics**

```php
// Controller
public function dashboard(AnalyticsService $service)
{
    $this->authorize('viewAnalytics', User::class);
    
    $stats = $service->getDashboardStats();
    
    return response()->json($stats);
}

// Response (200)
{
    "tools": {
        "total": 150,
        "approved": 120,
        "pending": 20,
        "rejected": 10
    },
    "ratings": {
        "total": 450,
        "average": 4.2
    },
    "comments": {
        "total": 850,
        "pending_moderation": 45
    },
    "categories": {
        "total": 8,
        "with_tools": 7
    },
    "engagement": {
        "views_total": 5000,
        "views_this_week": 400,
        "comments_this_week": 120
    },
    "growth": {
        "tools_this_week": 15,
        "tools_this_month": 45
    }
}
```

### GET /api/tools/{tool}/analytics
**Get tool-specific analytics**

```php
// Controller
public function toolAnalytics(Tool $tool, AnalyticsService $service)
{
    $analytics = $service->getToolAnalytics($tool);
    
    return response()->json($analytics);
}

// Response (200)
{
    "tool_id": 1,
    "tool_name": "VS Code",
    "views": 1500,
    "comments": 42,
    "average_rating": 4.8,
    "ratings_count": 25,
    "category": "Editor",
    "tags": ["productivity", "development"],
    "ratings_breakdown": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 5,
        "5": 20
    },
    "recent_comments": [ ... ]
}
```

### GET /api/admin/analytics/engagement
**Get engagement metrics**

```php
// Controller
public function engagement(Request $request)
{
    $this->authorize('viewAnalytics', User::class);
    
    $days = (int) $request->input('days', 7);
    
    $data = collect();
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = now()->subDays($i)->format('Y-m-d');
        $data->push([
            'date' => $date,
            'views' => /* query views for date */,
            'comments' => /* query comments for date */,
            'ratings' => /* query ratings for date */,
        ]);
    }
    
    return response()->json($data);
}

// Response (200)
[
    { "date": "2025-12-13", "views": 100, "comments": 15, "ratings": 8 },
    { "date": "2025-12-14", "views": 120, "comments": 18, "ratings": 10 },
]
```

---

## 6. Activity/Audit Log Endpoints

### GET /api/admin/activity-log
**Get activity log** (Admin only)

```php
// Controller
public function index(Request $request)
{
    $this->authorize('viewActivityLog', User::class);
    
    $activities = Activity::query()
        ->when($request->input('causer_type'), fn($q) => 
            $q->where('causer_type', $request->input('causer_type'))
        )
        ->when($request->input('event'), fn($q) => 
            $q->where('event', $request->input('event'))
        )
        ->with('causer', 'subject')
        ->latest()
        ->paginate();
    
    return ActivityResource::collection($activities);
}

// Query params
GET /api/admin/activity-log?causer_type=App\Models\User&event=created

// Response (200)
{
    "data": [
        {
            "id": 1,
            "event": "created",
            "causer": { "id": 1, "name": "John" },
            "subject": { "type": "Tool", "id": 1 },
            "created_at": "2025-12-19T10:00:00Z"
        }
    ]
}
```

### GET /api/admin/users/{user}/activity
**Get activity for specific user**

```php
// Controller
public function userActivity(User $user)
{
    $activities = Activity::where('causer_type', User::class)
        ->where('causer_id', $user->id)
        ->with('subject')
        ->latest()
        ->paginate();
    
    return ActivityResource::collection($activities);
}

// Response (200)
```

---

## Validation Rules

### CommentRequest
```php
public function rules(): array
{
    return [
        'content' => ['required', 'string', 'min:1', 'max:5000'],
        'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
    ];
}
```

### RatingRequest
```php
public function rules(): array
{
    return [
        'score' => ['required', 'integer', 'min:1', 'max:5'],
    ];
}
```

### JournalRequest
```php
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
```

### ModerationRequest
```php
public function rules(): array
{
    return [
        'approved' => ['required', 'boolean'],
    ];
}
```

---

## Route Registration

All routes should be registered in `routes/api.php`:

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
    Route::prefix('/journal')->group(function () {
        Route::post('/', [JournalController::class, 'store']);
        Route::get('/', [JournalController::class, 'index']);
        Route::get('/stats', [JournalController::class, 'stats']);
        Route::get('/{entry}', [JournalController::class, 'show']);
        Route::patch('/{entry}', [JournalController::class, 'update']);
        Route::delete('/{entry}', [JournalController::class, 'destroy']);
    });
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('/admin')->group(function () {
    // Comments moderation
    Route::post('/comments/{comment}/moderate', [CommentController::class, 'moderate']);
    
    // User management
    Route::patch('/users/{user}/ban', [UserController::class, 'ban']);
    Route::patch('/users/{user}/unban', [UserController::class, 'unban']);
    Route::patch('/users/{user}/roles', [UserController::class, 'setRoles']);
    Route::get('/users', [UserController::class, 'index']);
    
    // Analytics
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/analytics/engagement', [AnalyticsController::class, 'engagement']);
    Route::get('/activity-log', [ActivityController::class, 'index']);
    Route::get('/users/{user}/activity', [ActivityController::class, 'userActivity']);
});

Route::get('/tools/{tool}/analytics', [AnalyticsController::class, 'toolAnalytics']);
```

---

## Implementation Checklist

- [ ] Create CommentController (6 methods)
- [ ] Create RatingController (4 methods)
- [ ] Create JournalController (6 methods)
- [ ] Create UserController (3 admin methods)
- [ ] Create AnalyticsController (2 methods)
- [ ] Create ActivityController (2 methods)
- [ ] Create all Request validation classes (5 classes)
- [ ] Create all Resource classes (6 classes)
- [ ] Register all routes
- [ ] Test all endpoints
- [ ] Add API documentation

**Estimated Time**: 6-8 hours  
**Dependencies**: All Services created (✅ Complete)

