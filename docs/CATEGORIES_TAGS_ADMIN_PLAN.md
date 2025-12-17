# Categories & Tags Management - Admin Panel

**Feature**: Complete CRUD management for Categories and Tags
**Priority**: HIGH - Essential admin functionality
**Estimated Time**: 2-3 hours
**Status**: 🚧 In Progress

---

## 📋 Overview

Add full administrative control over Categories and Tags that are used to organize and filter tools. This completes the admin panel's core content management features.

### Current State
- ✅ Categories and Tags models exist
- ✅ Many-to-many relations with Tools
- ✅ Basic display in tool forms
- ❌ No admin CRUD interface
- ❌ Can't add/edit/delete categories or tags
- ❌ No validation or duplicate prevention

### Goal State
- ✅ Admin pages for Categories and Tags management
- ✅ Create, Read, Update, Delete operations
- ✅ Slug auto-generation from names
- ✅ Duplicate prevention
- ✅ Usage statistics (how many tools use each)
- ✅ Bulk operations (delete multiple)
- ✅ Search and filtering
- ✅ Proper authorization (admin/owner only)

---

## 🏗️ Implementation Plan

### Phase 1: Backend API (45 minutes)

#### 1.1 Category Controller
**File**: `backend/app/Http/Controllers/Admin/CategoryController.php`

```php
- index(): List all categories with tool counts
- store(): Create new category
- show(): Get single category with related tools
- update(): Update category (name, slug)
- destroy(): Delete category (check if used by tools)
- stats(): Get category usage statistics
```

**Validations**:
- Name: required, unique, max:100
- Slug: auto-generated from name, unique
- Can't delete if used by tools (or cascade/detach)

#### 1.2 Tag Controller
**File**: `backend/app/Http/Controllers/Admin/TagController.php`

```php
- index(): List all tags with tool counts
- store(): Create new tag
- show(): Get single tag with related tools
- update(): Update tag (name, slug)
- destroy(): Delete tag (check if used by tools)
- stats(): Get tag usage statistics
```

**Validations**:
- Name: required, unique, max:50
- Slug: auto-generated from name, unique
- Can't delete if used by tools (or cascade/detach)

#### 1.3 Routes
**File**: `backend/routes/api.php`

```php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::get('/categories/stats', [CategoryController::class, 'stats']);
    
    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::get('/tags/{id}', [TagController::class, 'show']);
    Route::put('/tags/{id}', [TagController::class, 'update']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);
    Route::get('/tags/stats', [TagController::class, 'stats']);
});
```

#### 1.4 Tests
**Files**: 
- `backend/tests/Feature/Admin/CategoryControllerTest.php`
- `backend/tests/Feature/Admin/TagControllerTest.php`

Test coverage:
- Authorization (admin only)
- CRUD operations
- Validation errors
- Duplicate prevention
- Delete protection

---

### Phase 2: Frontend API Layer (30 minutes)

#### 2.1 API Functions
**File**: `frontend/lib/api/admin.ts`

```typescript
// Categories
export async function getCategories(params = {}): Promise<Category[]>
export async function getCategory(id: number): Promise<Category>
export async function createCategory(data: CategoryPayload): Promise<Category>
export async function updateCategory(id: number, data: CategoryPayload): Promise<Category>
export async function deleteCategory(id: number): Promise<void>
export async function getCategoryStats(): Promise<CategoryStats>

// Tags
export async function getTags(params = {}): Promise<Tag[]>
export async function getTag(id: number): Promise<Tag>
export async function createTag(data: TagPayload): Promise<Tag>
export async function updateTag(id: number, data: TagPayload): Promise<Tag>
export async function deleteTag(id: number): Promise<void>
export async function getTagStats(): Promise<TagStats>
```

#### 2.2 React Query Hooks
**File**: `frontend/store/domains/admin.ts`

```typescript
// Categories
export function useGetCategoriesQuery(params?, options?)
export function useGetCategoryQuery(id, options?)
export function useCreateCategoryMutation()
export function useUpdateCategoryMutation()
export function useDeleteCategoryMutation()

// Tags
export function useGetTagsQuery(params?, options?)
export function useGetTagQuery(id, options?)
export function useCreateTagMutation()
export function useUpdateTagMutation()
export function useDeleteTagMutation()
```

---

### Phase 3: Frontend UI (60 minutes)

#### 3.1 Categories Management Page
**File**: `frontend/pages/admin/categories.tsx`

**Features**:
- Table view with columns: Name, Slug, Tool Count, Actions
- Search bar (filter by name)
- "Add Category" button → Modal
- Edit icon → Modal with pre-filled data
- Delete icon → Confirmation dialog
- Bulk select + bulk delete
- Pagination (20 per page)
- Loading skeletons
- Error handling with toasts

**UI Components**:
```tsx
<AdminLayout title="Categories" description="Manage tool categories">
  <div className="flex justify-between mb-4">
    <SearchInput />
    <Button onClick={openCreateModal}>+ Add Category</Button>
  </div>
  
  <Table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Slug</th>
        <th>Tools</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {categories.map(cat => (
        <CategoryRow key={cat.id} category={cat} />
      ))}
    </tbody>
  </Table>
  
  <Pagination />
  
  <CategoryModal isOpen={showModal} mode="create|edit" />
  <ConfirmDialog isOpen={showConfirm} onConfirm={deleteCategory} />
</AdminLayout>
```

#### 3.2 Tags Management Page
**File**: `frontend/pages/admin/tags.tsx`

**Features**: (Same as categories)
- Table view with columns: Name, Slug, Tool Count, Actions
- Search bar
- Add/Edit/Delete operations
- Bulk operations
- Pagination
- Theme-aware styling

#### 3.3 Shared Components
**File**: `frontend/components/admin/CategoryTagForm.tsx`

Reusable form for both categories and tags:
```tsx
interface Props {
  mode: 'create' | 'edit';
  type: 'category' | 'tag';
  initialData?: Category | Tag;
  onSubmit: (data) => void;
  onCancel: () => void;
}
```

**Fields**:
- Name input (required)
- Slug preview (auto-generated, read-only)
- Description textarea (optional)
- Submit/Cancel buttons

#### 3.4 Navigation Update
**File**: `frontend/components/admin/AdminNav.tsx`

Add new nav items:
```tsx
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/tools', label: 'Tools', icon: '🛠️' },
  { href: '/admin/categories', label: 'Categories', icon: '📁' },
  { href: '/admin/tags', label: 'Tags', icon: '🏷️' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/activity', label: 'Activity', icon: '📋' },
];
```

---

## 🎨 UI/UX Design

### Color Coding
- Categories: Blue theme (matches organizational structure)
- Tags: Purple theme (matches metadata/labels)

### Table Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Categories Management                         [+ Add Category] │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Search categories...                                      │
├──────────┬─────────────┬──────────┬─────────────────────────┤
│ Name     │ Slug        │ Tools    │ Actions                 │
├──────────┼─────────────┼──────────┼─────────────────────────┤
│ AI Tools │ ai-tools    │ 24       │ [Edit] [Delete]         │
│ Web Dev  │ web-dev     │ 18       │ [Edit] [Delete]         │
│ Design   │ design      │ 12       │ [Edit] [Delete]         │
└──────────┴─────────────┴──────────┴─────────────────────────┘
                                          [< Prev] Page 1/3 [Next >]
```

### Modal Design
```
┌─────────────────────────────────────────┐
│ Create Category                    [×]  │
├─────────────────────────────────────────┤
│                                         │
│ Name *                                  │
│ [_________________________________]     │
│                                         │
│ Slug (auto-generated)                   │
│ ai-tools                                │
│                                         │
│ Description (optional)                  │
│ [_________________________________]     │
│ [_________________________________]     │
│                                         │
│              [Cancel] [Create]          │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Validation

### Backend Validation Rules
```php
// Categories
'name' => 'required|string|max:100|unique:categories,name',
'description' => 'nullable|string|max:500',

// Tags
'name' => 'required|string|max:50|unique:tags,name',
'description' => 'nullable|string|max:255',
```

### Authorization
- All endpoints require `auth:sanctum` middleware
- All endpoints require admin role via custom middleware
- Frontend checks `isAdmin` before showing UI

### Data Integrity
- Prevent deletion if category/tag is used by tools
- Or offer cascade delete option with warning
- Slug uniqueness enforced at DB level

---

## 📊 Success Metrics

### Functionality
- [ ] Can create categories/tags
- [ ] Can edit existing categories/tags
- [ ] Can delete unused categories/tags
- [ ] Cannot delete if used by tools (or warning shown)
- [ ] Slug auto-generated correctly
- [ ] Search filters work
- [ ] Pagination works
- [ ] All operations show toast notifications

### Performance
- [ ] Category list loads in < 100ms (cached)
- [ ] Tag list loads in < 100ms (cached)
- [ ] Create/update operations < 200ms
- [ ] No N+1 queries (eager load counts)

### UX
- [ ] Admin nav updated with new items
- [ ] Theme colors applied correctly
- [ ] Loading states shown
- [ ] Error messages are clear
- [ ] Success toasts appear
- [ ] Modals are accessible (ESC to close)

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Admin can list categories/tags
- [ ] Non-admin cannot access endpoints
- [ ] Create category with valid data succeeds
- [ ] Create category with duplicate name fails
- [ ] Update category changes name and slug
- [ ] Delete unused category succeeds
- [ ] Delete used category fails (or cascades with warning)
- [ ] Same tests for tags

### Frontend Tests
- [ ] Categories page renders table
- [ ] Search filters categories
- [ ] Create modal opens and submits
- [ ] Edit modal pre-fills data
- [ ] Delete shows confirmation
- [ ] Toast notifications appear
- [ ] Same tests for tags

### Integration Tests
- [ ] Create category → appears in tool form dropdown
- [ ] Delete category → removed from tool associations
- [ ] Edit category → tools show updated name

---

## 📝 Implementation Steps

### Step 1: Backend Controllers (45 min)
```bash
cd backend
php artisan make:controller Admin/CategoryController
php artisan make:controller Admin/TagController
```

1. ✅ Create CategoryController with CRUD methods
2. ✅ Create TagController with CRUD methods
3. ✅ Add routes to routes/api.php
4. ✅ Test with Postman/Thunder Client
5. ✅ Write feature tests

### Step 2: Frontend API Layer (30 min)
```bash
cd frontend
```

1. ✅ Add API functions to lib/api/admin.ts
2. ✅ Add React Query hooks to store/domains/admin.ts
3. ✅ Test hooks with temporary UI

### Step 3: Frontend Pages (60 min)
1. ✅ Create pages/admin/categories.tsx
2. ✅ Create pages/admin/tags.tsx
3. ✅ Create components/admin/CategoryTagForm.tsx
4. ✅ Update components/admin/AdminNav.tsx
5. ✅ Add to AdminLayout navigation
6. ✅ Test all CRUD operations
7. ✅ Apply theme variables
8. ✅ Add loading/error states

### Step 4: Polish & Testing (15 min)
1. ✅ Add toast notifications
2. ✅ Test pagination
3. ✅ Test search
4. ✅ Test bulk operations
5. ✅ Verify mobile responsive
6. ✅ Cache configuration
7. ✅ Final QA

---

## 🚀 Deployment Notes

### Database
- No migrations needed (categories/tags tables already exist)
- May need to add description column if not present

### Cache
- Add cache tags: `categories`, `tags`
- Cache duration: 5 minutes
- Invalidate on create/update/delete

### Environment
- No new environment variables needed

---

## 🔄 Future Enhancements

### Phase 2 (Optional)
- [ ] Category/tag icons or colors
- [ ] Hierarchical categories (parent/child)
- [ ] Tag clouds visualization
- [ ] Import/export categories/tags (CSV)
- [ ] Merge duplicate categories/tags
- [ ] Category/tag analytics (trends over time)
- [ ] Suggest tags based on tool description (AI)

---

## 📚 Related Documentation

- [Backend API Routes](../backend/routes/api.php)
- [Admin Layout Component](../frontend/components/admin/AdminLayout.tsx)
- [React Query Patterns](../frontend/store/domains/README.md)
- [Testing Guidelines](./TESTING-BEST-PRACTICES-2025.md)

---

**Last Updated**: December 17, 2025
**Status**: 🚧 Ready to implement
