<?php

namespace App\Services;

use App\Mail\TwoFactorOtp;
use App\Models\TwoFactorChallenge;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use OTPHP\TOTP;

class TwoFactorService
{
    /**
     * Generate a TOTP secret and provisioning URI (for Google Authenticator)
     * Returns encrypted secret and provisioning URI (and optional QR base64 later)
     */
    public function generateTotpSecret(User $user): array
    {
        $totp = TOTP::create();
        $totp->setLabel($user->email);
        $totp->setIssuer(config('app.name'));

        $secret = $totp->getSecret();
        $provisioningUri = $totp->getProvisioningUri();

        // Store encrypted secret on user
        $user->two_factor_secret = encrypt($secret);
        $user->two_factor_type = 'totp';
        $user->two_factor_recovery_codes = encrypt(json_encode($this->generateRecoveryCodes()));
        $user->save();

        return [
            'provisioning_uri' => $provisioningUri,
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
        ];
    }

    public function verifyTotp(User $user, string $code): bool
    {
        if (! $user->two_factor_secret) {
            return false;
        }

        try {
            $secret = decrypt($user->two_factor_secret);
            $totp = TOTP::create($secret);

            return $totp->verify($code);
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Return provisioning URI and secret for an existing user secret
     * Returns null if user has no stored two-factor secret
     */
    public function getProvisioningUri(User $user): ?array
    {
        if (! $user->two_factor_secret) {
            return null;
        }

        try {
            $secret = decrypt($user->two_factor_secret);
            $totp = TOTP::create($secret);
            $totp->setLabel($user->email);
            $totp->setIssuer(config('app.name'));

            return [
                'provisioning_uri' => $totp->getProvisioningUri(),
                'secret' => $secret,
            ];
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Generate an SVG QR code for the given provisioning URI using Bacon QR library.
     * Returns raw SVG string or null on failure.
     */
    public function generateQrSvg(string $provisioningUri, int $size = 300): ?string
    {
        try {
            $rendererStyleClass = \BaconQrCode\Renderer\RendererStyle\RendererStyle::class;
            $rendererStyle = new $rendererStyleClass($size);
            $svgBackEndClass = \BaconQrCode\Renderer\Image\SvgImageBackEnd::class;
            $svgBackEnd = new $svgBackEndClass;
            $imageRendererClass = \BaconQrCode\Renderer\ImageRenderer::class;
            $renderer = new $imageRendererClass($rendererStyle, $svgBackEnd);
            $writer = new \BaconQrCode\Writer($renderer);

            $svg = $writer->writeString($provisioningUri);

            return $svg;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(10));
        }

        return $codes;
    }

    /**
     * Create and send an email or telegram OTP challenge record
     */
    public function createOtpChallenge(User $user, string $type = 'email', int $length = 6): TwoFactorChallenge
    {
        $code = (string) random_int(pow(10, $length - 1), pow(10, $length) - 1);

        $challenge = TwoFactorChallenge::create([
            'user_id' => $user->id,
            'code' => $code,
            'type' => $type,
            'used' => false,
            'expires_at' => now()->addMinutes(5),
        ]);

        // If telegram and user has chat id, attempt immediate delivery via TelegramService
        if ($type === 'telegram' && ! empty($user->telegram_chat_id)) {
            try {
                app()->make(\App\Services\TelegramService::class)->sendOtp($user, $code);
            } catch (\Throwable $e) {
                // swallow - delivery failure shouldn't prevent challenge creation
            }
        }

        // Send email when type is email
        if ($type === 'email') {
            try {
                Mail::to($user->email)->send(new TwoFactorOtp($code));
            } catch (\Throwable $e) {
                // swallow mail failures; challenge remains stored
            }
        }

        return $challenge;
    }

    /**
     * Create a short-lived link code for Telegram account linking.
     */
    public function createLinkChallenge(User $user, int $length = 6): TwoFactorChallenge
    {
        $code = (string) random_int(pow(10, $length - 1), pow(10, $length) - 1);

        $challenge = TwoFactorChallenge::create([
            'user_id' => $user->id,
            'code' => $code,
            'type' => 'telegram_link',
            'used' => false,
            'expires_at' => now()->addMinutes(15),
        ]);

        return $challenge;
    }

    public function verifyOtpChallenge(User $user, string $code, string $type = 'email'): bool
    {
        $challenge = TwoFactorChallenge::where('user_id', $user->id)
            ->where('type', $type)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->orderByDesc('id')
            ->first();

        if (! $challenge) {
            return false;
        }

        if (! hash_equals($challenge->code, $code)) {
            return false;
        }

        $challenge->used = true;
        $challenge->save();

        return true;
    }
}
