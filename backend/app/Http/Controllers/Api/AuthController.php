<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Authentication controller for user registration, login, logout
 * Handles SPA authentication with session-based auth (Sanctum)
 *
 * @package App\Http\Controllers\Api
 */
class AuthController extends Controller
{
    /**
     * Register a new user account
     *
     * @param Request $request
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
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

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
     * @param Request $request
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
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
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
     * @param Request $request
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
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @response 200 {"id": 1, "name": "John Doe", "email": "john@example.com", "roles": []}
     * @response 401 {"message": "Unauthenticated"}
     */
    public function user(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return response()->json($user->load('roles'));
    }
}
