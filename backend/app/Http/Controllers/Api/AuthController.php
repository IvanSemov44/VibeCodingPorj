<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Authentication controller for user registration, login, logout
 * Handles SPA authentication with session-based auth (Sanctum)
 */
class AuthController extends Controller
{
    /**
     * Register a new user account
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     *
     * @bodyParam name string required User's full name. Example: John Doe
     * @bodyParam email string required User's email address. Example: john@example.com
     * @bodyParam password string required Password (min 8 characters). Example: password123
     * @bodyParam password_confirmation string required Password confirmation. Example: password123
     *
     * @response 201 {"id": 1, "name": "John Doe", "email": "john@example.com", "roles": []}
     * @response 422 {"message": "The given data was invalid.", "errors": {"email": ["The email has already been taken."]}}
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);

        return response()->json($user->load('roles'), 201);
    }

    /**
     * Login user with email and password
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     *
     * @bodyParam email string required User's email. Example: john@example.com
     * @bodyParam password string required User's password. Example: password123
     *
     * @response 200 {"id": 1, "name": "John Doe", "email": "john@example.com", "roles": []}
     * @response 422 {"message": "The given data was invalid.", "errors": {"email": ["The provided credentials are incorrect."]}}
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return response()->json($user->load('roles'));
    }

    /**
     * Logout current user and invalidate session
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @response 200 {"message": "Successfully logged out"}
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get currently authenticated user with roles
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @response 200 {"id": 1, "name": "John Doe", "email": "john@example.com", "roles": []}
     * @response 401 {"message": "Unauthenticated"}
     */
    public function user(Request $request)
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return response()->json($user->load('roles'));
    }
}
