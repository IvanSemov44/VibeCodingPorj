<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Notifications\TwoFactorCode;
use App\Services\TwoFactorService;
use App\Models\TwoFactorChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TwoFactorController extends Controller
{
    public function __construct(private TwoFactorService $twoFactorService) {}

    // Request enabling 2FA (returns provisioning URI for TOTP)
    public function enable(Request $request)
    {
        $request->validate(['type' => 'required|in:totp,email,telegram']);
        $user = $request->user();

        if ($request->type === 'totp') {
            $data = $this->twoFactorService->generateTotpSecret($user);
            return response()->json(['provisioning_uri' => $data['provisioning_uri'], 'recovery_codes' => $data['recovery_codes']]);
        }

        if ($request->type === 'email') {
            $challenge = $this->twoFactorService->createOtpChallenge($user, 'email');
            $user->notify(new TwoFactorCode($challenge->code));
            return response()->json(['message' => 'OTP sent to email']);
        }

        if ($request->type === 'telegram') {
            // Create a short-lived link code that user will send to the bot
            $challenge = $this->twoFactorService->createLinkChallenge($user);
            return response()->json([
                'message' => 'Send the following code to the Telegram bot to link your account',
                'link_code' => $challenge->code,
            ]);
        }
    }

    public function confirm(Request $request)
    {
        $request->validate(['code' => 'required']);
        $user = $request->user();

        $ok = false;

        if ($user->two_factor_type === 'totp') {
            $ok = $this->twoFactorService->verifyTotp($user, $request->code);
        } else {
            $ok = $this->twoFactorService->verifyOtpChallenge($user, $request->code, $user->two_factor_type ?? 'email');
        }

        if (!$ok) {
            return response()->json(['message' => 'Invalid code'], 422);
        }

        $user->two_factor_confirmed_at = now();
        $user->save();

        if (function_exists('activity')) {
            call_user_func('activity')->causedBy($user)->log('2fa_enabled');
        } else {
            Log::info('2fa_enabled', ['user' => $user->id]);
        }

        return response()->json(['message' => '2FA enabled']);
    }

    // Login-time challenge verification (no auth middleware)
    public function challenge(Request $request)
    {
        $request->validate(['email' => 'required|email', 'code' => 'required']);

        $user = \App\Models\User::where('email', $request->email)->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $ok = false;
        if ($user->two_factor_type === 'totp') {
            $ok = $this->twoFactorService->verifyTotp($user, $request->code);
        } else {
            $ok = $this->twoFactorService->verifyOtpChallenge($user, $request->code, $user->two_factor_type ?? 'email');
        }

        if (!$ok) {
            return response()->json(['message' => 'Invalid or expired code'], 422);
        }

        // Optionally create a session here or return success for frontend to finish login
        return response()->json(['message' => '2FA verified']);
    }

    public function disable(Request $request)
    {
        $user = $request->user();
        $user->two_factor_type = null;
        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_confirmed_at = null;
        $user->save();

        if (function_exists('activity')) {
            call_user_func('activity')->causedBy($user)->log('2fa_disabled');
        } else {
            Log::info('2fa_disabled', ['user' => $user->id]);
        }

        return response()->json(['message' => '2FA disabled']);
    }

    /**
     * Return provisioning URI for authenticated user if a TOTP secret exists.
     * This is a convenience endpoint for frontend to obtain the otpauth URI.
     */
    public function secret(Request $request)
    {
        $user = $request->user();
        $data = $this->twoFactorService->getProvisioningUri($user);

        if (!$data) {
            return response()->json(['message' => 'No two-factor secret configured'], 404);
        }

        // Mask secret for safety when returning (frontend should prefer the URI)
        $secret = $data['secret'] ?? null;
        $masked = null;
        if ($secret) {
            $len = strlen($secret);
            $masked = substr($secret, 0, 4) . '...' . substr($secret, max(0, $len - 4));
        }

        return new \App\Http\Resources\TwoFactorSecretResource([
            'provisioning_uri' => $data['provisioning_uri'],
            'secret_mask' => $masked,
        ]);
    }

    /**
     * Return an SVG QR code for the authenticated user's TOTP provisioning URI.
     * Responds with `image/svg+xml` so frontend can display it directly if desired.
     */
    public function qrSvg(Request $request)
    {
        $user = $request->user();
        $data = $this->twoFactorService->getProvisioningUri($user);
        if (!$data || empty($data['provisioning_uri'])) {
            return response()->json(['message' => 'No two-factor secret configured'], 404);
        }

        $svg = $this->twoFactorService->generateQrSvg($data['provisioning_uri'], 300);
        if (!$svg) {
            return response()->json(['message' => 'Failed to generate QR'], 500);
        }

        return response($svg, 200)->header('Content-Type', 'image/svg+xml');
    }
}
