<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', \App\Http\Middleware\CheckRole::class . ':owner,pm']);
    }

    public function index(Request $request)
    {
        $query = User::with('roles')
            ->when($request->search, fn($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )
            ->when($request->role, fn($q, $role) =>
                $q->whereHas('roles', fn($q) => $q->where('name', $role))
            )
            ->when($request->status, fn($q, $status) =>
                $q->where('is_active', $status === 'active')
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
}
