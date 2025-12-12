<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user.
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->log('user_registered');

        return $user;
    }

    /**
     * Attempt to log in a user.
     *
     * @throws ValidationException
     */
    public function login(array $credentials): User
    {
        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        // Update last login info
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
            'failed_login_attempts' => 0,
        ]);

        activity()
            ->causedBy($user->id)
            ->log('user_logged_in');

        return $user;
    }

    /**
     * Log out the current user.
     */
    public function logout(): void
    {
        $user = Auth::user();

        if ($user) {
            activity()
                ->causedBy($user->id)
                ->log('user_logged_out');
        }

        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * Check if user account is active and not locked.
     */
    public function isAccountAccessible(User $user): bool
    {
        if (! ($user->is_active ?? true)) {
            return false;
        }

        if ($user->locked_until && $user->locked_until->isFuture()) {
            return false;
        }

        return true;
    }

    /**
     * Increment failed login attempts and lock account if necessary.
     */
    public function handleFailedLogin(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return;
        }

        $user->increment('failed_login_attempts');
        $user->refresh(); // Reload to get updated count

        // Lock account after 5 failed attempts for 15 minutes
        if ($user->failed_login_attempts >= 5) {
            $user->update([
                'locked_until' => now()->addMinutes(15),
            ]);

            activity()
                ->performedOn($user)
                ->log('account_locked_too_many_attempts');
        }
    }
}
