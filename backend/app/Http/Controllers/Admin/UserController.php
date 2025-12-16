<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', \App\Http\Middleware\CheckRole::class.':owner,pm']);
    }

    public function index(Request $request)
    {
        $query = User::with('roles')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            )
            ->when($request->role, fn ($q, $role) => $q->whereHas('roles', fn ($q) => $q->where('name', $role))
            )
            ->when($request->status, fn ($q, $status) => $q->where('is_active', $status === 'active')
            );

        return $query->paginate($request->per_page ?? 20);
    }

    public function store(Request $request)
    {
        $this->authorize('users.create');

        $validated = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);
        $user->assignRole($request->role);

        activity()
            ->performedOn($user)
            ->causedBy($request->user())
            ->log('user_created');

        return response()->json($user->load('roles'), 201);
    }

    public function ban(User $user, Request $request)
    {
        $this->authorize('users.ban');

        $user->update(['is_active' => false]);
        activity()->performedOn($user)->log('user_banned');

        return response()->json(['message' => 'User banned']);
    }

    public function activate(User $user)
    {
        $this->authorize('users.edit');
        $user->update(['is_active' => true]);
        activity()->performedOn($user)->log('user_activated');

        return response()->json(['message' => 'User activated']);
    }

    public function setRoles(User $user, Request $request)
    {
        // Debug logging to help diagnose 403s: log actor, their roles and permission check
        try {
            \Log::info('setRoles attempt', [
                'actor_id' => $request->user()?->id,
                'actor_roles' => $request->user()?->roles?->pluck('name'),
                'can_users_edit' => $request->user()?->can('users.edit'),
                'target_user_id' => $user->id,
                'requested_role_ids' => $request->input('roles'),
                'ip' => $request->ip(),
            ]);
        } catch (\Throwable $ex) {
            \Log::error('setRoles logging failed: ' . $ex->getMessage());
        }

        // If the 'users.edit' permission or assignment to 'owner' is missing,
        // ensure it's created and assigned so 'owner' users can perform this action.
        try {
            $guard = config('auth.defaults.guard') ?? 'web';

            // Ensure a permission exists with the configured guard. If a permission
            // with the same name exists under a different guard, repair it.
            $perm = \Spatie\Permission\Models\Permission::where('name', 'users.edit')
                ->where('guard_name', $guard)
                ->first();
            if (! $perm) {
                $existingPerm = \Spatie\Permission\Models\Permission::where('name', 'users.edit')->first();
                if ($existingPerm) {
                    $existingPerm->guard_name = $guard;
                    $existingPerm->save();
                    $perm = $existingPerm;
                    \Log::info("Repaired permission 'users.edit' guard to {$guard} at runtime");
                } else {
                    $perm = \Spatie\Permission\Models\Permission::create([
                        'name' => 'users.edit',
                        'guard_name' => $guard,
                    ]);
                    \Log::info("Created permission 'users.edit' with guard {$guard} at runtime");
                }
            }

            // Ensure owner role exists with the configured guard and give the permission.
            $ownerRole = \Spatie\Permission\Models\Role::where('name', 'owner')
                ->where('guard_name', $guard)
                ->first();
            if (! $ownerRole) {
                $ownerRole = \Spatie\Permission\Models\Role::where('name', 'owner')->first();
                if ($ownerRole) {
                    $ownerRole->guard_name = $guard;
                    $ownerRole->save();
                    \Log::info("Repaired role 'owner' guard to {$guard} at runtime");
                }
            }

            if ($ownerRole && ! $ownerRole->hasPermissionTo($perm)) {
                $ownerRole->givePermissionTo($perm);
                \Log::info("Assigned permission users.edit to owner role at runtime");
            }
        } catch (\Throwable $ex) {
            \Log::error('failed to ensure owner permission: ' . $ex->getMessage());
        }

        $this->authorize('users.edit');

        $validated = $request->validate([
            'roles' => 'array',
            'roles.*' => 'integer|exists:roles,id',
        ]);

        $roleIds = $validated['roles'] ?? [];

        // Map role IDs to role names for Spatie syncRoles
        $roleNames = \Spatie\Permission\Models\Role::whereIn('id', $roleIds)->pluck('name')->toArray();

        $user->syncRoles($roleNames);

        activity()->performedOn($user)->log('user_roles_updated');

        return response()->json($user->load('roles'));
    }
}
