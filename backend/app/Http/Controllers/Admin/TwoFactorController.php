<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    protected TwoFactorService $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->middleware('auth:sanctum');
        $this->twoFactorService = $twoFactorService;
    }

    // Show current user's 2FA status
    public function show(User $user)
    {
        $data = [
            'two_factor_type' => $user->two_factor_type,
            'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
            'has_secret' => ! empty($user->two_factor_secret),
        ];

        if ($user->two_factor_type === 'totp' && $user->two_factor_secret) {
            $prov = $this->twoFactorService->getProvisioningUri($user);
            if ($prov) {
                $data['provisioning_uri'] = $prov['provisioning_uri'];
            }
        }

        return response()->json($data);
    }

    // Set or update a user's 2FA type. Accepts type = totp|email|telegram|none
    public function store(Request $request, User $user)
    {
        $actor = $request->user();
        $allowed = false;
        if ($actor) {
            if (method_exists($actor, 'hasRole') && $actor->hasRole('owner')) {
                $allowed = true;
            }
            if (! $allowed && method_exists($actor, 'hasPermissionTo')) {
                try {
                    if ($actor->hasPermissionTo('users.edit')) {
                        $allowed = true;
                    }
                } catch (\Exception $e) {
                    // permission may not exist — treat as not allowed
                }
            }
        }

        if (! $allowed) {
            return response()->json(['message' => 'Insufficient privileges'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|string|in:totp,email,telegram,none',
        ]);

        $type = $validated['type'];

        if ($type === 'none') {
            // disable
            $user->update([
                'two_factor_type' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ]);

            activity()->performedOn($user)->causedBy($request->user())->log('2fa_disabled_by_admin');

            return response()->json(['message' => '2FA disabled for user']);
        }

        if ($type === 'totp') {
            $result = $this->twoFactorService->generateTotpSecret($user);

            activity()->performedOn($user)->causedBy($request->user())->withProperties(['method' => 'totp'])->log('2fa_enabled_by_admin');

            return response()->json(array_merge(['message' => 'TOTP enabled'], $result));
        }

        // For email or telegram, set type and create + send a challenge
        if (in_array($type, ['email', 'telegram'])) {
            $user->two_factor_type = $type;
            $user->two_factor_confirmed_at = null;
            $user->save();

            $challenge = $this->twoFactorService->createOtpChallenge($user, $type);

            activity()->performedOn($user)->causedBy($request->user())->withProperties(['method' => $type])->log('2fa_challenge_created_by_admin');

            return response()->json(['message' => 'Challenge created', 'challenge_expires_at' => $challenge->expires_at]);
        }

        return response()->json(['error' => 'Invalid type'], 422);
    }

    // Remove/disable 2FA for a user
    public function destroy(Request $request, User $user)
    {
        $actor = $request->user();
        $allowed = false;
        if ($actor) {
            if (method_exists($actor, 'hasRole') && $actor->hasRole('owner')) {
                $allowed = true;
            }
            if (! $allowed && method_exists($actor, 'hasPermissionTo') && $actor->hasPermissionTo('users.edit')) {
                $allowed = true;
            }
        }

        if (! $allowed) {
            return response()->json(['message' => 'Insufficient privileges'], 403);
        }

        $user->update([
            'two_factor_type' => null,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        activity()->performedOn($user)->causedBy($request->user())->log('2fa_disabled_by_admin');

        return response()->json(['message' => '2FA disabled']);
    }
}
