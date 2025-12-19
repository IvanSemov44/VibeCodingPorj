# Phase 4 Architecture Diagram

## Event-Driven Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP REQUEST (POST/DELETE)                     │
│              /api/tools/{id}/comments (Create Comment)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                              │
│              CommentController::store()                          │
│   ├─ Validate request                                           │
│   ├─ Call CreateCommentAction                                   │
│   └─ Return 201 response                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     ACTION LAYER                                 │
│              CreateCommentAction::execute()                      │
│   ├─ BEGIN DB::transaction                                      │
│   ├─ Create Comment model                                       │
│   ├─ Log Activity                                               │
│   ├─ Event::dispatch(CommentCreated($comment))  ← EVENT         │
│   ├─ COMMIT transaction                                         │
│   └─ Return comment                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EVENT SERVICE PROVIDER                          │
│            Maps: CommentCreated → Listeners[]                   │
│                                                                 │
│  EventServiceProvider::$listen                                  │
│  [                                                              │
│    CommentCreated::class => [                                  │
│      SendCommentNotification::class                            │
│    ]                                                            │
│  ]                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LISTENER LAYER                                │
│           SendCommentNotification::handle()                      │
│           (implements ShouldQueue - runs async)                  │
│   ├─ Extract comment from event                                 │
│   ├─ Job::dispatch(SendCommentNotificationJob($comment))        │
│   └─ Listener complete (async job queued)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    QUEUE SYSTEM                                  │
│         QUEUE_CONNECTION=database (configurable)                │
│                                                                 │
│  jobs table stores:                                             │
│  {                                                              │
│    "queue": "default",                                          │
│    "payload": "...",                                            │
│    "attempts": 0,                                               │
│    "reserved_at": null,                                         │
│    "available_at": now()                                        │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    JOB WORKER                                    │
│        php artisan queue:work (separate process)                │
│                                                                 │
│  Worker polls jobs table:                                       │
│  ├─ Dequeue SendCommentNotificationJob                         │
│  ├─ Execute handle() method                                     │
│  └─ Mark as complete or failed                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  QUEUED JOB LAYER                                │
│        SendCommentNotificationJob::handle()                      │
│   ├─ Load comment from DB                                       │
│   ├─ Find tool owner (if not author)                           │
│   ├─ Send notification via Mail::send()                         │
│   ├─ Find parent comment author (if reply)                      │
│   ├─ Send notification via Mail::send()                         │
│   ├─ Log job completion to Activity                             │
│   └─ Job complete                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Ban User Event Flow with Duration

```
┌──────────────────────────────────────────────────────────────┐
│  REQUEST: POST /api/admin/users/{id}/ban                    │
│  BODY: { reason: "spam", duration: "1w" }                   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ UserController::ban()                                        │
│ ├─ Validate: reason (string), duration (1h|1d|1w|permanent)│
│ ├─ Get UserService from container                          │
│ └─ Call: ban($user, $reason, $duration, $admin)            │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ UserService::ban()                                           │
│ └─ Call: banAction->execute($user, $reason, $duration, ...)│
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ BanUserAction::execute()                                    │
│                                                              │
│ Duration Mapping:                                           │
│ ┌─────────┬──────────────────────┐                         │
│ │ Input   │ Behavior             │                         │
│ ├─────────┼──────────────────────┤                         │
│ │ '1h'    │ now()->addHour()     │                         │
│ │ '1d'    │ now()->addDay()      │                         │
│ │ '1w'    │ now()->addWeek()     │                         │
│ │ permanent│ null (no expiry)    │                         │
│ └─────────┴──────────────────────┘                         │
│                                                              │
│ ├─ Calculate banned_until timestamp                         │
│ ├─ Update user fields:                                     │
│ │  ├─ is_banned = true                                     │
│ │  ├─ banned_until = timestamp (or null)                   │
│ │  └─ ban_reason = "spam"                                  │
│ ├─ Log Activity                                             │
│ ├─ Event::dispatch(UserBanned($user, $reason, $duration))  │
│ └─ Return updated user                                      │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ Event: UserBanned                                            │
│ ├─ Properties:                                              │
│ │  ├─ user: User model                                      │
│ │  ├─ reason: "spam" (string)                              │
│ │  └─ duration: "1w" (string)                              │
│ └─ Broadcasts to registered listeners                       │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ Listener: LogUserBanning (ShouldQueue)                       │
│ ├─ Extract properties from event                            │
│ ├─ Create Activity record:                                  │
│ │  ├─ subject: User model                                   │
│ │  ├─ action: 'user_banned'                                 │
│ │  └─ properties:                                            │
│ │     ├─ reason: 'spam'                                      │
│ │     ├─ duration: '1w'                                      │
│ │     └─ banned_until: '2025-12-26 10:30:00'              │
│ └─ Listener complete                                         │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ Activity Log Entry Created                                   │
│ {                                                            │
│   "subject_type": "App\\Models\\User",                      │
│   "subject_id": 123,                                         │
│   "event": "user_banned",                                    │
│   "causer_type": "App\\Models\\User",                       │
│   "causer_id": 456,                                          │
│   "properties": {                                            │
│     "reason": "spam",                                        │
│     "duration": "1w",                                        │
│     "banned_until": "2025-12-26T10:30:00+00:00"            │
│   },                                                         │
│   "created_at": "2025-12-19T10:30:00+00:00"               │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

## Event Mapping Diagram

```
EVENTS (8 total)
├─ CommentCreated
│  └─ Listener: SendCommentNotification
│     └─ Job: SendCommentNotificationJob
│
├─ CommentDeleted
│  └─ Listener: LogCommentDeletion
│     └─ Activity: record deletion
│
├─ RatingCreated
│  └─ Listener: UpdateRatingAnalytics
│     ├─ Update user rating average
│     └─ Job: UpdateAnalyticsJob
│
├─ RatingDeleted
│  └─ Listener: RecalculateRatingAverage
│     ├─ Recalculate average
│     └─ Job: UpdateAnalyticsJob
│
├─ JournalEntryCreated
│  └─ Listener: LogJournalEntryCreation
│     └─ Activity: record creation
│
├─ JournalEntryDeleted
│  └─ Listener: LogJournalEntryDeletion
│     └─ Activity: record deletion
│
├─ UserBanned
│  └─ Listener: LogUserBanning
│     └─ Activity: record ban with metadata
│
└─ UserUnbanned
   └─ Listener: LogUserUnbanning
      └─ Activity: record unban
```

## Data Flow - Rating Update Example

```
POST /api/tools/1/ratings
{ "user_id": 5, "rating": 4 }
          ↓
RatingController::store()
          ↓
CreateRatingAction::execute()
  ├─ Save Rating model
  ├─ Log Activity
  └─ Event::dispatch(RatingCreated($rating)) ← EVENT
          ↓
UpdateRatingAnalytics listener (ShouldQueue)
  ├─ Update Tool::ratings_average
  │   avg = SELECT AVG(rating) FROM ratings WHERE tool_id = 1
  ├─ Update Tool::ratings_count
  │   count = SELECT COUNT(*) FROM ratings WHERE tool_id = 1
  └─ Job::dispatch(UpdateAnalyticsJob($rating)) ← QUEUE JOB
          ↓
UpdateAnalyticsJob (runs in queue worker)
  ├─ Load rating from DB
  ├─ Determine type: 'rating'
  ├─ Call updateRatingMetrics()
  │   ├─ AVG(rating)
  │   └─ COUNT(rating)
  ├─ Update Tool record
  └─ Log completion
```

## File Organization

```
app/
├─ Events/                    (8 new events)
│  ├─ CommentCreated.php
│  ├─ CommentDeleted.php
│  ├─ RatingCreated.php
│  ├─ RatingDeleted.php
│  ├─ JournalEntryCreated.php
│  ├─ JournalEntryDeleted.php
│  ├─ UserBanned.php
│  └─ UserUnbanned.php
│
├─ Listeners/                 (8 new listeners)
│  ├─ SendCommentNotification.php
│  ├─ LogCommentDeletion.php
│  ├─ UpdateRatingAnalytics.php
│  ├─ RecalculateRatingAverage.php
│  ├─ LogJournalEntryCreation.php
│  ├─ LogJournalEntryDeletion.php
│  ├─ LogUserBanning.php
│  └─ LogUserUnbanning.php
│
├─ Jobs/                      (4 new jobs)
│  ├─ SendCommentNotificationJob.php
│  ├─ UpdateAnalyticsJob.php
│  ├─ SendWelcomeEmailJob.php
│  └─ ExportActivityLogsJob.php
│
├─ Actions/
│  ├─ Comment/
│  │  ├─ CreateCommentAction.php ✅ UPDATED
│  │  └─ DeleteCommentAction.php ✅ UPDATED
│  ├─ Rating/
│  │  ├─ CreateRatingAction.php ✅ UPDATED
│  │  └─ DeleteRatingAction.php ✅ UPDATED
│  ├─ JournalEntry/
│  │  ├─ CreateJournalEntryAction.php ✅ UPDATED
│  │  └─ DeleteJournalEntryAction.php ✅ UPDATED
│  └─ User/
│     ├─ BanUserAction.php ✅ UPDATED
│     └─ UnbanUserAction.php ✅ UPDATED
│
├─ Services/
│  └─ UserService.php ✅ UPDATED
│
├─ Http/Controllers/Admin/
│  └─ UserController.php ✅ UPDATED
│
└─ Providers/
   ├─ EventServiceProvider.php ✅ NEW
   └─ ... (other providers)

bootstrap/
└─ providers.php ✅ UPDATED
```

## Queue System Architecture

```
┌─────────────────────────────────────────┐
│     HTTP Request Handling (Sync)        │
├─────────────────────────────────────────┤
│ 1. Validate                             │
│ 2. Create model                         │
│ 3. Dispatch event                       │
│ 4. Return response (200/201)            │
└─────────────────────────────────────────┘
            ↓ (async)
┌─────────────────────────────────────────┐
│     Queue (database table)              │
├─────────────────────────────────────────┤
│ jobs table:                             │
│ - id: auto-increment                    │
│ - queue: default                        │
│ - payload: serialized job               │
│ - attempts: 0                           │
│ - reserved_at: null                     │
│ - available_at: now()                   │
│ - created_at: now()                     │
└─────────────────────────────────────────┘
            ↓ (pulled by worker)
┌─────────────────────────────────────────┐
│  Queue Worker (separate process)        │
├─────────────────────────────────────────┤
│ php artisan queue:work                  │
│ - Polls jobs table every second         │
│ - Dequeues available jobs               │
│ - Executes handle()                     │
│ - Handles failures/retries              │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│     Job Processing (handle method)      │
├─────────────────────────────────────────┤
│ - Load required models                  │
│ - Perform work (send email, etc)        │
│ - Update databases                      │
│ - Log completion                        │
└─────────────────────────────────────────┘
```

---

**Phase 4 Architecture Complete**
All diagrams represent the actual implementation.
