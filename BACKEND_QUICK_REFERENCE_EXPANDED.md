# Backend Architecture Quick Reference - Phase 2 Expansion

**Updated**: December 19, 2025  
**Coverage**: Comments, Ratings, Journal, User Management, Analytics

---

## Table of Contents
1. [Comment Operations](#comment-operations)
2. [Rating Operations](#rating-operations)
3. [Journal Operations](#journal-operations)
4. [User Management](#user-management)
5. [Analytics](#analytics)
6. [Database Queries](#database-queries)
7. [Testing](#testing)
8. [Common Patterns](#common-patterns)

---

## Comment Operations

### Creating a Comment

```php
// In Controller
public function store(CommentRequest $request, CommentService $service)
{
    // Validate input
    $data = CommentData::fromRequest($request->validated());
    
    // Create comment
    $comment = $service->create($data, auth()->user());
    
    // Return response
    return response()->json($comment->load('user', 'tool'), 201);
}
```

### Comment DTOs

```php
// Standard comment
$data = new CommentData(
    toolId: 1,
    userId: 1,
    content: 'Great tool!',
    parentId: null,
);

// Reply to comment
$reply = new CommentData(
    toolId: 1,
    userId: 1,
    content: 'Thanks for the feedback!',
    parentId: 5,  // Parent comment ID
);

// From request
$data = CommentData::fromRequest([
    'tool_id' => 1,
    'user_id' => 1,
    'content' => 'Amazing!',
    'parent_id' => null,
]);
```

### Comment Queries

```php
// Get all comments for a tool
$comments = Comment::where('tool_id', 1)
    ->with('user', 'replies')
    ->latest()
    ->paginate();

// Get pending moderation
$pending = Comment::whereNull('is_moderated')
    ->with('user', 'tool')
    ->latest()
    ->get();

// Get approved comments only
$approved = Comment::where('is_moderated', true)
    ->with('user')
    ->paginate();

// Get user's comments
$userComments = auth()->user()->comments()
    ->with('tool')
    ->latest()
    ->paginate();

// Get reply count for a comment
$replyCount = $comment->replies()->count();
```

### Comment Operations

```php
// Delete comment
$deleted = $service->delete($comment, auth()->user());

// Moderate comment (approve)
$moderated = $service->moderate($comment, true, auth()->user());

// Moderate comment (reject)
$moderated = $service->moderate($comment, false, auth()->user());
```

### What Happens Automatically

When you create a comment:
1. ✅ Comment record is created
2. ✅ Tool's `comments_count` is incremented
3. ✅ Activity is logged to `activity_log`
4. ✅ Relationships are loaded

When you delete a comment:
1. ✅ Comment record is deleted
2. ✅ Tool's `comments_count` is decremented
3. ✅ Activity is logged
4. ✅ All replies are also deleted (cascade)

When you moderate a comment:
1. ✅ Comment `is_moderated` is set
2. ✅ Comment `moderated_by` is recorded
3. ✅ Activity is logged with decision

---

## Rating Operations

### Creating/Updating a Rating

```php
// In Controller
public function rate(RatingRequest $request, RatingService $service)
{
    // Create or update rating (one per user per tool)
    $data = RatingData::fromRequest($request->validated());
    $rating = $service->create($data, auth()->user());
    
    // Tool's average_rating is automatically recalculated
    return response()->json($rating);
}
```

### Rating DTOs

```php
// Standard rating (1-5 scale)
$data = new RatingData(
    toolId: 1,
    userId: 1,
    score: 5,
);

// From request
$data = RatingData::fromRequest([
    'tool_id' => 1,
    'user_id' => 1,
    'score' => 4,
]);

// Update existing rating (same user/tool)
$data = new RatingData(
    toolId: 1,
    userId: 1,
    score: 3,  // Changed from 5 to 3
);
$updated = $service->create($data, auth()->user());  // Same ID, updated score
```

### Rating Queries

```php
// Get all ratings for a tool
$ratings = Rating::where('tool_id', 1)
    ->with('user')
    ->get();

// Get user's rating for a tool
$userRating = Rating::where('tool_id', 1)
    ->where('user_id', auth()->id())
    ->first();

// Get ratings breakdown (count by score)
$breakdown = Rating::where('tool_id', 1)
    ->selectRaw('score, COUNT(*) as count')
    ->groupBy('score')
    ->get();
// Result: [
//   { score: 1, count: 2 },
//   { score: 2, count: 0 },
//   { score: 3, count: 5 },
//   { score: 4, count: 10 },
//   { score: 5, count: 20 },
// ]

// Average rating for a tool
$avg = $tool->average_rating;  // Auto-calculated, stored in tools table
```

### Rating Operations

```php
// Delete rating
$deleted = $service->delete($rating, auth()->user());

// Check if user has rated
if ($tool->ratings()->where('user_id', auth()->id())->exists()) {
    // User has already rated
}
```

### What Happens Automatically

When you create a rating:
1. ✅ Rating record created or updated
2. ✅ Tool's `average_rating` is recalculated
3. ✅ Activity is logged
4. ✅ Rating returned with loaded relations

When you delete a rating:
1. ✅ Rating record is deleted
2. ✅ Tool's `average_rating` is recalculated
3. ✅ Activity is logged

---

## Journal Operations

### Creating a Journal Entry

```php
// In Controller
public function store(JournalRequest $request, JournalService $service)
{
    $data = JournalEntryData::fromRequest($request->validated());
    $entry = $service->create($data, auth()->user());
    
    return response()->json($entry);
}
```

### Journal DTOs

```php
// Standard entry
$data = new JournalEntryData(
    userId: 1,
    title: 'Productive Day',
    content: 'Learned about Laravel architecture today...',
    mood: 'happy',
    tags: ['learning', 'laravel', 'progress'],
);

// Entry without mood
$data = new JournalEntryData(
    userId: 1,
    title: 'Code Review',
    content: 'Reviewed team PRs...',
    mood: null,
    tags: ['work'],
);

// From request
$data = JournalEntryData::fromRequest([
    'user_id' => 1,
    'title' => 'Today',
    'content' => 'Great day',
    'mood' => 'excited',
    'tags' => ['positive'],
]);
```

### Journal Queries

```php
// Get user's journal entries
$entries = auth()->user()->journalEntries()
    ->latest()
    ->paginate();

// Filter by mood
$happyEntries = JournalEntry::where('user_id', auth()->id())
    ->where('mood', 'happy')
    ->latest()
    ->get();

// Filter by date range
$weekEntries = JournalEntry::where('user_id', auth()->id())
    ->where('created_at', '>=', now()->subWeek())
    ->latest()
    ->get();

// Get entries with specific tag
$learningEntries = JournalEntry::where('user_id', auth()->id())
    ->whereJsonContains('tags', 'learning')
    ->latest()
    ->get();
```

### Journal Operations

```php
// Update entry
$data = JournalEntryData::fromRequest($request->validated());
$updated = $service->update($entry, $data, auth()->user());

// Delete entry
$deleted = $service->delete($entry, auth()->user());
```

### What Happens Automatically

When you create a journal entry:
1. ✅ Entry is created
2. ✅ Activity is logged
3. ✅ User ownership is verified
4. ✅ Tags are stored as JSON

When you update an entry:
1. ✅ Entry is updated
2. ✅ Activity is logged with diff (if tracked)
3. ✅ User ownership verified

When you delete an entry:
1. ✅ Entry is deleted
2. ✅ Activity is logged

---

## User Management

### Banning Users

```php
// In Admin Controller
public function ban(User $user, UserService $service)
{
    // Ban with reason
    $banned = $service->ban(
        user: $user,
        reason: 'Violates community guidelines',
        admin: auth()->user(),
    );
    
    return response()->json($banned);
}
```

### Unbanning Users

```php
public function unban(User $user, UserService $service)
{
    $unbanned = $service->unban($user, auth()->user());
    return response()->json($unbanned);
}
```

### Managing User Roles

```php
// Set user roles
$data = UserRoleData::fromRequest([
    'user_id' => 1,
    'roles' => ['editor', 'reviewer'],
]);

$user = $service->setRoles($user, $data, auth()->user());

// Check user roles
if ($user->hasRole('admin')) {
    // ...
}

// Check user permissions
if ($user->can('approve-tools')) {
    // ...
}
```

### User Queries

```php
// Get banned users
$banned = User::whereNotNull('banned_at')->get();

// Get users with specific role
$admins = User::role('admin')->get();

// Get user ban reason
$reason = $user->ban_reason;

// Check if user is banned
if ($user->banned_at) {
    // User is banned
}
```

### What Happens Automatically

When you ban a user:
1. ✅ `banned_at` timestamp is set
2. ✅ Ban reason is stored
3. ✅ Activity is logged to admin audit trail
4. ✅ User is prevented from actions (middleware)

When you unbanned a user:
1. ✅ `banned_at` is cleared
2. ✅ `ban_reason` is cleared
3. ✅ Activity is logged

When you set roles:
1. ✅ Old roles are logged in activity
2. ✅ New roles are synced via Spatie/Permission
3. ✅ Admin who made change is recorded

---

## Analytics

### Dashboard Statistics

```php
// In Admin Controller
public function dashboard(AnalyticsService $service)
{
    $stats = $service->getDashboardStats();
    
    return response()->json($stats);
}

// Response structure:
// {
//   "tools": {
//     "total": 150,
//     "approved": 120,
//     "pending": 20,
//     "rejected": 10
//   },
//   "ratings": {
//     "total": 450,
//     "average": 4.2
//   },
//   "comments": {
//     "total": 850,
//     "pending_moderation": 45
//   },
//   "categories": {
//     "total": 8,
//     "with_tools": 7
//   },
//   "engagement": {
//     "views_total": 5000,
//     "views_this_week": 400,
//     "comments_this_week": 120
//   },
//   "growth": {
//     "tools_this_week": 15,
//     "tools_this_month": 45
//   }
// }
```

### Tool Analytics

```php
// Get analytics for specific tool
$tool = Tool::findOrFail(1);
$analytics = $service->getToolAnalytics($tool);

// Response structure:
// {
//   "tool_id": 1,
//   "tool_name": "VS Code",
//   "views": 1500,
//   "comments": 42,
//   "average_rating": 4.8,
//   "ratings_count": 25,
//   "category": "Editor",
//   "tags": ["productivity", "development"],
//   "created_at": "2025-01-01T00:00:00Z",
//   "updated_at": "2025-12-19T15:30:00Z",
//   "status": "approved",
//   "ratings_breakdown": {
//     "1": 0,
//     "2": 1,
//     "3": 2,
//     "4": 5,
//     "5": 20
//   },
//   "recent_comments": [
//     {
//       "id": 1,
//       "content": "Great tool!",
//       "user": "John Doe",
//       "created_at": "2025-12-19T15:00:00Z"
//     }
//   ]
// }
```

### Custom Analytics Queries

```php
// View count by category
Category::withCount([
    'tools as total_views' => fn($q) => $q->selectRaw('COALESCE(SUM(view_count), 0)')
])->get();

// Top rated tools
Tool::orderBy('average_rating', 'desc')
    ->limit(10)
    ->get();

// Most commented tools
Tool::orderBy('comments_count', 'desc')
    ->limit(10)
    ->get();

// Engagement score (custom)
Tool::withCount('comments', 'ratings')
    ->selectRaw('(view_count + (comments_count * 5) + (ratings_count * 3)) as engagement_score')
    ->orderBy('engagement_score', 'desc')
    ->get();
```

---

## Database Queries

### Query Objects (Available from Phase 2a)

```php
// Tool Query Object
$query = app(ToolQuery::class);

$tools = $query
    ->search('laravel')                    // Search by name/description
    ->category(1)                           // Filter by category
    ->tags([1, 2, 3])                       // Filter by tags
    ->status('approved')                    // Filter by status
    ->role('editor')                        // Filter by owner role
    ->minRating(4)                          // Filter by minimum rating
    ->approved()                            // Only approved tools
    ->withComments()                        // Eager load comments
    ->withRatings()                         // Eager load ratings
    ->orderByRating('desc')                 // Order by rating
    ->paginate(15);

// Activity Query Object
$activityQuery = app(ActivityQuery::class);

$activities = $activityQuery
    ->causer(auth()->user())                // By causer
    ->subject(Tool::class, 1)               // By subject
    ->event('created')                      // By event type
    ->fromDate(now()->subWeek())            // Date range
    ->latest()
    ->paginate();
```

### Activity Log Queries

```php
// Get all activities for a user
$activities = Activity::where('causer_type', User::class)
    ->where('causer_id', auth()->id())
    ->latest()
    ->paginate();

// Get all changes to a tool
$changes = Activity::where('subject_type', Tool::class)
    ->where('subject_id', 1)
    ->latest()
    ->paginate();

// Get specific event type
$creates = Activity::where('event', 'created')
    ->latest()
    ->paginate();

// Audit trail for admin
$adminActions = Activity::where('causer_type', User::class)
    ->whereIn('event', ['banned', 'deleted', 'rejected'])
    ->latest()
    ->paginate();
```

### Cache Keys (Available)

```php
// Use for consistent caching
CacheKeys::toolCount()                      // tools:count
CacheKeys::toolByCategory(1)                // tools:category:1
CacheKeys::categoryCount()                  // categories:count
CacheKeys::averageRating()                  // ratings:average
CacheKeys::userProfile(1)                   // users:profile:1
CacheKeys::dashboardStats()                 // analytics:dashboard
```

---

## Testing

### Test Helpers Available

```php
// In tests
use Tests\Traits\CreatesTools;
use Tests\Traits\CreatesUsers;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyTest extends TestCase {
    use CreatesTools, CreatesUsers, RefreshDatabase;
    
    // Create tools
    $tool = $this->createTool();
    $tools = $this->createTools(5);
    $approved = $this->createApprovedTool();
    $pending = $this->createPendingTool();
    
    // Create users
    $user = $this->createUser();
    $admin = $this->createAdminUser();
    $editor = $this->createEditorUser();
}
```

### Running Tests

```bash
# All tests
php artisan test

# Specific file
php artisan test tests/Unit/Actions/Comment/CreateCommentActionTest.php

# With coverage
php artisan test --coverage

# Stop on first failure
php artisan test --fail-on-failure
```

### Test Pattern

```php
public function test_create_comment_increments_tool_count(): void
{
    // Arrange
    $user = $this->createUser();
    $tool = $this->createApprovedTool();
    $initialCount = $tool->comments_count;
    
    // Act
    $service = app(CommentService::class);
    $data = new CommentData(/* ... */);
    $comment = $service->create($data, $user);
    
    // Assert
    $tool->refresh();
    $this->assertEquals($initialCount + 1, $tool->comments_count);
}
```

---

## Common Patterns

### Transaction Safety

All Actions wrap mutations in `DB::transaction()`:
```php
// Safe - either all succeed or all rollback
$comment = $service->create($data, $user);
// If anything fails between creation and activity log, all is rolled back
```

### Activity Logging

All mutations are logged:
```php
// Every action creates an entry in activity_log
// View with: Activity::latest()->paginate()
// Search with: Activity::where('event', 'created')->get()
```

### Dependency Injection

Always inject services:
```php
// ✅ Good
public function __construct(private CommentService $service) {}

// ❌ Avoid
$service = new CommentService();
```

### DTO Usage

Always use DTOs for input:
```php
// ✅ Good
$data = CommentData::fromRequest($request->validated());
$comment = $service->create($data, auth()->user());

// ❌ Avoid
$comment = Comment::create($request->all());
```

### Authorization

Check permissions before calling services:
```php
// In Controller
if (!auth()->user()->can('comment-on-tools')) {
    abort(403);
}

$data = CommentData::fromRequest($request->validated());
$comment = $service->create($data, auth()->user());
```

### Error Handling

```php
try {
    $data = CommentData::fromRequest($request->validated());
    $comment = $service->create($data, auth()->user());
} catch (Exception $e) {
    return response()->json(
        ['error' => 'Failed to create comment'],
        500
    );
}
```

---

## Service Dependencies

All services use dependency injection:

```php
// CommentService depends on:
- CreateCommentAction
- DeleteCommentAction
- ModerateCommentAction

// RatingService depends on:
- CreateRatingAction
- DeleteRatingAction

// JournalService depends on:
- CreateJournalEntryAction
- UpdateJournalEntryAction
- DeleteJournalEntryAction

// UserService depends on:
- BanUserAction
- UnbanUserAction
- SetUserRolesAction

// AnalyticsService depends on:
- GetDashboardStatsAction
- GetToolAnalyticsAction
```

All are automatically resolved by Laravel's service container.

---

## Next Steps

1. Create API endpoints for each service
2. Add validation rules for requests
3. Create integration tests
4. Add event listeners for notifications
5. Implement caching for analytics
6. Add API documentation

---

**Last Updated**: Dec 19, 2025  
**Maintained By**: Backend Team  
**Questions?** See BACKEND_IMPLEMENTATION_PROGRESS.md
