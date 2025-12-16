# Comprehensive Development Plan
**Project**: VibeCoding AI Tools Platform
**Current Status**: 87% Complete (Day 7-8 done, Day 9 partial)
**Generated**: 2025-12-16

---

## 🎯 Executive Summary

**Current State:**
- ✅ Full-stack foundation with auth, RBAC, 2FA
- ✅ Complete Tool CRUD with filters, search, pagination
- ✅ 133 passing tests with 60%+ coverage
- ✅ Comprehensive documentation
- ⚠️ Missing: Admin approval workflow, centralized admin dashboard, caching

**Goal:** Complete the platform to production-ready state with all Day 9-10 features.

**Estimated Time to Completion:** 12-16 hours (split across 3-4 work sessions)

---

## 📋 Development Phases

### Phase 1: Quick Wins & Code Quality (2-3 hours)
**Goal:** Clean up existing code, fix warnings, improve stability

### Phase 2: Admin Core Features (4-6 hours)
**Goal:** Build missing admin functionality (approval workflow, dashboard)

### Phase 3: Performance & Polish (3-4 hours)
**Goal:** Add caching, optimize queries, improve UX

### Phase 4: Advanced Features (3-4 hours, Optional)
**Goal:** Add bonus features (analytics, comments, ratings)

---

## 🚀 PHASE 1: Quick Wins & Code Quality

**Duration:** 2-3 hours
**Priority:** HIGH (foundation for everything else)

### Task 1.1: Fix ESLint Warnings (30 minutes)

**Files to fix:**
1. `frontend/components/TagMultiSelect.tsx` (4 warnings)
   ```typescript
   // Lines 47, 56-58: Remove unused destructured variables
   // Current: const { placeholder: _placeholder, ... } = props;
   // Fix: Don't destructure unused props, or prefix with underscore consistently
   ```

2. `frontend/tests/setupTests.ts` (1 warning)
   ```typescript
   // Line 1: Remove unused eslint-disable directive
   // Fix: Remove the directive or add the actual import that needs it
   ```

3. `frontend/tests/test-utils.tsx` (1 warning)
   ```typescript
   // Same as above - clean up eslint-disable
   ```

4. `frontend/components/TagMultiSelect/TagMultiSelect.stories.tsx` (1 warning)
   ```typescript
   // Line 4: Assign object to variable before export
   // Current: export default { title: '...', ... }
   // Fix: const meta = { title: '...', ... }; export default meta;
   ```

**Commands:**
```bash
cd frontend
npm run lint -- --fix
npm run lint  # Verify remaining warnings
```

**Acceptance Criteria:**
- [x] Zero ESLint errors
- [x] ESLint warnings reduced from 7 to 0

---

### Task 1.2: Remove Unused Code (30 minutes)

**Files to check:**
1. Search for unused exports:
   ```bash
   npm run find:unused-exports
   ```

2. Remove dead code from recent refactoring

3. Clean up commented code in:
   - `frontend/components/ToolForm.tsx`
   - `frontend/pages/tools/index.tsx`

**Acceptance Criteria:**
- [x] No unused exports detected
- [x] No commented-out code blocks
- [x] All imports are used

---

### Task 1.3: Improve Test Coverage (1-2 hours)

**Priority areas** (currently untested or low coverage):

1. **Add tests for Tool approval workflow** (prepare for Phase 2)
   ```typescript
   // File: frontend/tests/components/admin/ToolApproval.test.tsx (to create)
   // Tests: approve tool, reject tool, bulk approve, filter by status
   ```

2. **Add tests for Admin Dashboard components** (to create)
   ```typescript
   // File: frontend/tests/components/admin/AdminStats.test.tsx
   // Tests: stats display, loading states, error handling
   ```

3. **Add integration tests for tool workflow**
   ```typescript
   // File: frontend/tests/pages/tools.integration.test.tsx
   // Tests: create tool → pending → admin approve → visible in list
   ```

**Commands:**
```bash
cd frontend
npm test -- --coverage
# Target: Increase coverage to 70%+
```

**Acceptance Criteria:**
- [x] Test coverage ≥ 70% (currently ~60%)
- [x] All critical user flows have integration tests
- [ ] No failing tests

---

## 🔐 PHASE 2: Admin Core Features

**Duration:** 4-6 hours
**Priority:** HIGH (completes Day 9 requirements)

### Task 2.1: Backend - Tool Approval Endpoints (1 hour)

**Files to create/modify:**

1. **Create approval action** (NEW FILE)
   ```php
   // File: backend/app/Actions/Tool/ApproveToolAction.php (already exists!)
   // Verify it updates status to 'approved'
   ```

2. **Add rejection action** (NEW FILE)
   ```php
   // File: backend/app/Actions/Tool/RejectToolAction.php
   namespace App\Actions\Tool;

   use App\Models\Tool;
   use App\Enums\ToolStatus;

   class RejectToolAction
   {
       public function execute(Tool $tool, ?string $reason = null): Tool
       {
           $tool->update([
               'status' => ToolStatus::REJECTED,
               'rejection_reason' => $reason,
           ]);

           // Optional: Send notification to tool creator

           return $tool->fresh();
       }
   }
   ```

3. **Add migration for rejection_reason** (if not exists)
   ```bash
   cd backend
   php artisan make:migration add_rejection_reason_to_tools_table
   ```
   ```php
   // Migration: database/migrations/XXXX_add_rejection_reason_to_tools_table.php
   Schema::table('tools', function (Blueprint $table) {
       $table->text('rejection_reason')->nullable()->after('status');
   });
   ```

4. **Add admin routes** (MODIFY EXISTING)
   ```php
   // File: backend/routes/api.php
   // Add inside admin group (around line 78):
   Route::post('tools/{tool}/approve', [App\Http\Controllers\Api\ToolController::class, 'approve']);
   Route::post('tools/{tool}/reject', [App\Http\Controllers\Api\ToolController::class, 'reject']);
   Route::get('tools/pending', [App\Http\Controllers\Api\ToolController::class, 'pending']);
   ```

5. **Add controller methods** (MODIFY EXISTING)
   ```php
   // File: backend/app/Http/Controllers/Api/ToolController.php
   use App\Actions\Tool\ApproveToolAction;
   use App\Actions\Tool\RejectToolAction;

   public function approve(Tool $tool, ApproveToolAction $action)
   {
       $this->authorize('update', $tool); // Or create ApprovalPolicy

       $approved = $action->execute($tool);

       return response()->json([
           'message' => 'Tool approved successfully',
           'data' => new ToolResource($approved),
       ]);
   }

   public function reject(Tool $tool, RejectToolAction $action, Request $request)
   {
       $this->authorize('update', $tool);

       $rejected = $action->execute($tool, $request->input('reason'));

       return response()->json([
           'message' => 'Tool rejected',
           'data' => new ToolResource($rejected),
       ]);
   }

   public function pending()
   {
       $this->authorize('viewAny', Tool::class);

       $tools = Tool::where('status', ToolStatus::PENDING)
           ->withRelations()
           ->orderBy('created_at', 'desc')
           ->paginate(20);

       return ToolResource::collection($tools);
   }
   ```

**Testing:**
```bash
# Test endpoints with curl or Postman
curl -X POST http://localhost:8201/api/admin/tools/1/approve \
  -H "Cookie: your-session-cookie" \
  -H "X-CSRF-TOKEN: your-csrf-token"

curl -X GET http://localhost:8201/api/admin/tools/pending
```

**Acceptance Criteria:**
- [x] `POST /api/admin/tools/{id}/approve` works
- [x] `POST /api/admin/tools/{id}/reject` works with reason
- [x] `GET /api/admin/tools/pending` returns pending tools
- [x] Authorization checks work (admin/owner only)
- [x] Migration applied successfully

---

### Task 2.2: Frontend - Admin Tool Approval Page (2-3 hours)

**Files to create:**

1. **Create approval page** (NEW FILE)
   ```typescript
   // File: frontend/pages/admin/tools.tsx
   import React, { useState } from 'react';
   import { useGetPendingToolsQuery, useApproveToolMutation, useRejectToolMutation } from '../../store/domains';
   import Layout from '../../components/Layout';

   export default function AdminToolsPage() {
     const { data, isLoading, refetch } = useGetPendingToolsQuery();
     const [approveTool] = useApproveToolMutation();
     const [rejectTool] = useRejectToolMutation();
     const [rejectReason, setRejectReason] = useState('');
     const [selectedTool, setSelectedTool] = useState<number | null>(null);

     // Component implementation...
   }
   ```

2. **Add RTK Query mutations** (MODIFY EXISTING)
   ```typescript
   // File: frontend/store/domains/index.ts
   // Add to toolsApi endpoints:

   getPendingTools: builder.query({
     query: () => 'admin/tools/pending',
     providesTags: ['Tool'],
   }),

   approveTool: builder.mutation({
     query: (id) => ({
       url: `admin/tools/${id}/approve`,
       method: 'POST',
     }),
     invalidatesTags: ['Tool'],
   }),

   rejectTool: builder.mutation({
     query: ({ id, reason }) => ({
       url: `admin/tools/${id}/reject`,
       method: 'POST',
       body: { reason },
     }),
     invalidatesTags: ['Tool'],
   }),
   ```

3. **Create admin tool card component** (NEW FILE)
   ```typescript
   // File: frontend/components/admin/ToolApprovalCard.tsx
   interface Props {
     tool: Tool;
     onApprove: (id: number) => Promise<void>;
     onReject: (id: number, reason: string) => Promise<void>;
   }

   export default function ToolApprovalCard({ tool, onApprove, onReject }: Props) {
     // Display tool details + approve/reject buttons
   }
   ```

4. **Update navigation** (MODIFY EXISTING)
   ```typescript
   // File: frontend/components/Layout.tsx
   // Add admin link (line ~60):
   {user && hasRole(['owner', 'admin']) && (
     <Link href="/admin/tools">
       <a>Pending Tools</a>
     </Link>
   )}
   ```

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Pending Tool Approvals (5)                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📦 Claude Code Extension                            │
│  By: Ivan Ivanov (ivan@admin.local)                │
│  Category: Developer Tools                          │
│  Tags: [CLI, AI, Coding]                           │
│  Description: AI-powered code assistant...          │
│                                                      │
│  [✓ Approve]  [✗ Reject]  [👁 View Details]        │
│                                                      │
├─────────────────────────────────────────────────────┤
│  (more tools...)                                    │
└─────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Page displays all pending tools
- [ ] Approve button changes tool status to "approved"
- [ ] Reject button shows modal for reason input
- [ ] Success/error toasts appear
- [ ] List refreshes after action
- [ ] Only accessible by admin/owner roles

---

### Task 2.3: Admin Dashboard Page (2 hours)

**Files to create:**

1. **Create dashboard page** (NEW FILE)
   ```typescript
   // File: frontend/pages/admin/index.tsx
   import React from 'react';
   import { useGetAdminStatsQuery } from '../../store/domains';
   import Layout from '../../components/Layout';
   import Card from '../../components/Card';

   export default function AdminDashboard() {
     const { data: stats, isLoading } = useGetAdminStatsQuery();

     return (
       <Layout>
         <h1>Admin Dashboard</h1>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <StatsCard title="Total Tools" value={stats?.totalTools} />
           <StatsCard title="Pending Approval" value={stats?.pendingTools} />
           <StatsCard title="Active Users" value={stats?.activeUsers} />
         </div>

         <RecentActivity />
         <QuickActions />
       </Layout>
     );
   }
   ```

2. **Create backend stats endpoint** (MODIFY EXISTING)
   ```php
   // File: backend/routes/api.php
   // Add to admin group:
   Route::get('stats', [App\Http\Controllers\Admin\AdminController::class, 'stats']);
   ```

3. **Create AdminController** (NEW FILE)
   ```php
   // File: backend/app/Http/Controllers/Admin/AdminController.php
   namespace App\Http\Controllers\Admin;

   use App\Models\Tool;
   use App\Models\User;
   use App\Enums\ToolStatus;

   class AdminController extends Controller
   {
       public function stats()
       {
           return response()->json([
               'totalTools' => Tool::count(),
               'pendingTools' => Tool::where('status', ToolStatus::PENDING)->count(),
               'approvedTools' => Tool::where('status', ToolStatus::APPROVED)->count(),
               'rejectedTools' => Tool::where('status', ToolStatus::REJECTED)->count(),
               'activeUsers' => User::where('is_active', true)->count(),
               'totalUsers' => User::count(),
               'recentTools' => Tool::latest()->take(5)->get(),
           ]);
       }
   }
   ```

4. **Create stats components** (NEW FILES)
   ```typescript
   // File: frontend/components/admin/StatsCard.tsx
   // File: frontend/components/admin/RecentActivity.tsx
   // File: frontend/components/admin/QuickActions.tsx
   ```

**Dashboard Features:**
- Stats overview (tools, users, activity)
- Recent submissions
- Quick action buttons (approve pending, manage users, view logs)
- System health status

**Acceptance Criteria:**
- [ ] Dashboard shows accurate statistics
- [ ] Recent activity displays latest 10 actions
- [ ] Quick links to admin sections work
- [ ] Loading states for all data
- [ ] Error handling for failed requests

---

## ⚡ PHASE 3: Performance & Polish

**Duration:** 3-4 hours
**Priority:** MEDIUM (improves UX and performance)

### Task 3.1: Implement Caching (1-2 hours)

**Files to modify:**

1. **Cache categories/tags/roles** (MODIFY EXISTING)
   ```php
   // File: backend/app/Http/Controllers/Api/CategoryController.php
   use Illuminate\Support\Facades\Cache;

   public function index()
   {
       $categories = Cache::remember('categories', 3600, function () {
           return Category::orderBy('name')->get();
       });

       return CategoryResource::collection($categories);
   }

   public function store(Request $request)
   {
       $category = Category::create($request->validated());
       Cache::forget('categories');
       return new CategoryResource($category);
   }
   ```

2. **Cache approved tools** (MODIFY EXISTING)
   ```php
   // File: backend/app/Http/Controllers/Api/ToolController.php
   public function index(Request $request)
   {
       // Only cache if no filters applied
       if (empty($request->all())) {
           $tools = Cache::remember('tools.approved.page.1', 300, function () {
               return Tool::approved()
                   ->withRelations()
                   ->paginate(20);
           });
       } else {
           // Dynamic query, don't cache
           $tools = Tool::query()
               ->when($request->q, fn($q, $search) => $q->search($search))
               ->when($request->category, fn($q, $cat) => $q->whereHas('categories', fn($qq) => $qq->where('slug', $cat)))
               ->paginate($request->per_page ?? 20);
       }

       return ToolResource::collection($tools);
   }
   ```

3. **Add cache warming command** (NEW FILE)
   ```php
   // File: backend/app/Console/Commands/WarmCache.php
   php artisan make:command WarmCache

   // Command to pre-populate cache on deployment:
   public function handle()
   {
       Cache::put('categories', Category::all(), 3600);
       Cache::put('tags', Tag::all(), 3600);
       Cache::put('roles', \Spatie\Permission\Models\Role::all(), 3600);

       $this->info('Cache warmed successfully!');
   }
   ```

**Caching Strategy:**
- **Static data**: categories, tags, roles → 1 hour TTL
- **Dynamic queries**: approved tools list → 5 min TTL
- **User-specific**: permissions, 2FA status → 15 min TTL
- **Cache invalidation**: On create/update/delete

**Acceptance Criteria:**
- [ ] Categories cached (verify with Redis CLI)
- [ ] Tags cached
- [ ] Roles cached
- [ ] Cache invalidates on updates
- [ ] Response times improved (use browser DevTools)

---

### Task 3.2: Optimize Database Queries (1 hour)

**Files to check:**

1. **Add indexes** (NEW MIGRATION)
   ```bash
   php artisan make:migration add_indexes_for_performance
   ```
   ```php
   Schema::table('tools', function (Blueprint $table) {
       $table->index('status');
       $table->index('created_at');
       $table->index(['status', 'created_at']);
   });

   Schema::table('users', function (Blueprint $table) {
       $table->index('email');
       $table->index('is_active');
   });
   ```

2. **Check N+1 queries**
   ```bash
   # Install Laravel Debugbar (dev only)
   composer require barryvdh/laravel-debugbar --dev

   # Visit pages and check "Queries" tab
   ```

3. **Add eager loading** (CHECK EXISTING)
   ```php
   // File: backend/app/Http/Controllers/Api/ToolController.php
   // Ensure all relationships are eager loaded:
   Tool::with(['categories', 'tags', 'roles'])->get();
   ```

**Acceptance Criteria:**
- [ ] No N+1 query warnings in debugbar
- [ ] All foreign keys indexed
- [ ] Eager loading used consistently

---

### Task 3.3: Improve Loading States (1 hour)

**Files to modify:**

1. **Add skeleton loaders** (CREATE NEW COMPONENTS)
   ```typescript
   // File: frontend/components/Loading/SkeletonCard.tsx
   export function SkeletonCard() {
     return (
       <div className="animate-pulse">
         <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
         <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
         <div className="h-3 bg-gray-200 rounded w-5/6"></div>
       </div>
     );
   }
   ```

2. **Replace "Loading..." text** (MODIFY EXISTING)
   ```typescript
   // File: frontend/pages/tools/index.tsx
   // Replace: {isLoading ? <div>Loading...</div> : ...}
   // With:
   {isLoading ? (
     <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
       {Array.from({ length: 6 }).map((_, i) => (
         <SkeletonCard key={i} />
       ))}
     </div>
   ) : ...}
   ```

**Acceptance Criteria:**
- [ ] All pages show skeleton loaders
- [ ] No "Loading..." text visible
- [ ] Smooth transitions from loading to content

---

## 🌟 PHASE 4: Advanced Features (Optional)

**Duration:** 3-4 hours per feature
**Priority:** LOW (bonus features for portfolio showcase)

### Task 4.1: Tool Analytics & Stats (3-4 hours)

**Features:**
- View count tracking
- Most popular tools widget
- Tool usage trends graph
- User engagement metrics

**Files to create:**
- `backend/app/Models/ToolView.php`
- `backend/database/migrations/XXXX_create_tool_views_table.php`
- `frontend/pages/admin/analytics.tsx`
- `frontend/components/charts/PopularToolsChart.tsx`

**Implementation:**
```php
// Track views
Route::get('tools/{tool}', function (Tool $tool) {
    ToolView::create([
        'tool_id' => $tool->id,
        'user_id' => auth()->id(),
        'ip_address' => request()->ip(),
    ]);

    return new ToolResource($tool);
});
```

---

### Task 4.2: Comments & Ratings System (4-5 hours)

**Features:**
- Users can comment on tools
- 5-star rating system
- Average rating display
- Comment moderation

**Files to create:**
- `backend/app/Models/Comment.php`
- `backend/app/Models/Rating.php`
- `backend/database/migrations/XXXX_create_comments_table.php`
- `backend/database/migrations/XXXX_create_ratings_table.php`
- `frontend/components/tools/CommentSection.tsx`
- `frontend/components/tools/RatingStars.tsx`

---

### Task 4.3: Activity Logs Viewer (2 hours)

**Features:**
- View all user actions
- Filter by user, action type, date
- Export logs to CSV
- Search functionality

**Files to create:**
- `frontend/pages/admin/activity.tsx`
- `backend/routes/api.php` (add activity endpoint)
- `frontend/components/admin/ActivityLogTable.tsx`

---

## 📅 Suggested Work Schedule

### Session 1: Quick Wins (2-3 hours)
**Focus:** Clean, stable foundation
- ✅ Fix all ESLint warnings (30 min)
- ✅ Remove unused code (30 min)
- ✅ Add critical tests (1-2 hours)

**End Goal:** Zero warnings, 70%+ test coverage

---

### Session 2: Admin Core (4-6 hours)
**Focus:** Complete Day 9 requirements
- ✅ Backend approval endpoints (1 hour)
- ✅ Migration for rejection_reason (15 min)
- ✅ Admin approval page (2-3 hours)
- ✅ Admin dashboard (2 hours)

**End Goal:** Full admin workflow functional

---

### Session 3: Performance (3-4 hours)
**Focus:** Production-ready optimization
- ✅ Implement caching (1-2 hours)
- ✅ Database optimization (1 hour)
- ✅ Loading state improvements (1 hour)

**End Goal:** Fast, smooth UX

---

### Session 4: Advanced Features (Optional, 3-4 hours)
**Focus:** Portfolio showcase features
- 🎯 Choose one: Analytics OR Comments OR Activity Logs
- 🎯 Implement fully with tests

**End Goal:** One impressive showcase feature

---

## 🎯 Milestone Checklist

### Milestone 1: Code Quality ✅
- [ ] Zero ESLint errors/warnings
- [ ] No unused exports
- [ ] Test coverage ≥ 70%
- [ ] All tests passing

### Milestone 2: Admin Complete ✅
- [ ] Tool approval workflow works end-to-end
- [ ] Admin dashboard displays stats
- [ ] Pending tools page functional
- [ ] Authorization checks in place

### Milestone 3: Performance ✅
- [ ] Caching implemented
- [ ] Database indexed
- [ ] No N+1 queries
- [ ] Skeleton loaders on all pages

### Milestone 4: Advanced (Optional) 🌟
- [ ] One bonus feature fully implemented
- [ ] Feature has tests
- [ ] Feature documented

---

## 🚀 How to Use This Plan

### Starting a Work Session:
```bash
# 1. Pull latest code
git pull origin main

# 2. Create feature branch
git checkout -b feature/admin-approval-workflow

# 3. Read the relevant section above
# 4. Follow the tasks in order
# 5. Test each change
# 6. Commit frequently

# 7. Push and create PR
git push origin feature/admin-approval-workflow
```

### Daily Workflow:
1. ☕ Pick a Phase/Task
2. 📖 Read the detailed instructions
3. 💻 Implement with AI assistance
4. 🧪 Test (manual + automated)
5. ✅ Check off the acceptance criteria
6. 🎉 Commit & move to next task

---

## 💡 Pro Tips

### Use AI Effectively:
```
Good prompt:
"Create the admin tool approval page at frontend/pages/admin/tools.tsx.
It should:
- Display pending tools in cards
- Have approve/reject buttons
- Show confirmation modal for rejection
- Use the useGetPendingToolsQuery hook
- Match the existing UI style from tools/index.tsx"

Bad prompt:
"Make admin page"
```

### Testing Strategy:
1. **Unit tests**: Components, hooks, utilities
2. **Integration tests**: Full user flows (create tool → approve → view)
3. **Manual testing**: Click through UI, check edge cases

### Commit Strategy:
```bash
# Good commits:
git commit -m "feat: add tool approval endpoints"
git commit -m "fix: resolve ESLint warnings in TagMultiSelect"
git commit -m "test: add approval workflow integration tests"

# Bad commits:
git commit -m "updates"
git commit -m "wip"
```

---

## 📊 Success Metrics

### Code Quality:
- ✅ ESLint: 0 errors, 0 warnings
- ✅ TypeScript: No `any` types
- ✅ Tests: 70%+ coverage, all passing

### Features:
- ✅ Admin can approve/reject tools
- ✅ Dashboard shows real-time stats
- ✅ Cache improves load times by 50%+
- ✅ All pages responsive on mobile

### User Experience:
- ✅ Loading states feel instant (< 200ms perceived)
- ✅ Toast notifications for all actions
- ✅ Error messages are helpful
- ✅ No dead ends (always a way forward)

---

## 🎉 Project Completion Checklist

When you've finished, you should have:

- [ ] **Functional admin panel** with approval workflow
- [ ] **Centralized dashboard** with stats and quick actions
- [ ] **Performant queries** with caching and indexes
- [ ] **Professional UI** with loading states and error handling
- [ ] **Comprehensive tests** covering critical paths
- [ ] **Clean code** with zero warnings
- [ ] **Documentation** updated with new features
- [ ] **Demo-ready** - can showcase live to stakeholders

---

## 🤝 Need Help?

**Stuck on a task?** Ask Claude:
- "Help me implement [specific task from plan]"
- "I'm getting this error: [error message]"
- "How do I test [specific feature]?"

**Want to adjust the plan?** That's fine!
- Skip optional features
- Reorder tasks based on priority
- Add your own ideas

**Ready to start?** Say:
- "Let's start with Phase 1, Task 1.1"
- "I want to build the admin approval page first"
- "Help me fix the ESLint warnings"

---

## 📚 Resources

- **Laravel Docs**: https://laravel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **RTK Query**: https://redux-toolkit.js.org/rtk-query
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev

---

**This plan is your roadmap to 100% completion. Let's build! 🚀**
