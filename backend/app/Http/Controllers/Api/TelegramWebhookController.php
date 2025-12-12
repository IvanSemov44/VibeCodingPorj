<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TwoFactorChallenge;
use App\Models\User;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();
        $message = $payload['message'] ?? $payload['edited_message'] ?? null;

        if (! $message) {
            return response()->json(['ok' => true]);
        }

        $chat = $message['chat'] ?? null;
        $text = trim($message['text'] ?? '');

        if (! $chat || ! $text) {
            return response()->json(['ok' => true]);
        }

        $chatId = $chat['id'];

        // Handle /verify <code> command for linking
        if (str_starts_with($text, '/verify')) {
            $parts = preg_split('/\s+/', $text);
            if (count($parts) < 2) {
                $this->reply($chatId, 'Usage: /verify <code>');

                return response()->json(['ok' => true]);
            }
            $code = $parts[1];

            $challenge = TwoFactorChallenge::where('code', $code)
                ->where('type', 'telegram_link')
                ->where('used', false)
                ->where('expires_at', '>', now())
                ->first();

            if (! $challenge) {
                $this->reply($chatId, 'Invalid or expired code. Please request a new link code from the website.');

                return response()->json(['ok' => true]);
            }

            $user = User::find($challenge->user_id);
            if (! $user) {
                $this->reply($chatId, 'User not found.');

                return response()->json(['ok' => true]);
            }

            // Link user's telegram_chat_id
            $user->telegram_chat_id = (string) $chatId;
            $user->telegram_verified = true;
            $user->save();

            $challenge->used = true;
            $challenge->save();

            $this->reply($chatId, 'Your account has been linked successfully. You will receive OTPs here when requested.');

            return response()->json(['ok' => true]);
        }

        // Optionally handle other commands e.g., /start
        if (str_starts_with($text, '/start')) {
            $this->reply($chatId, 'Hello! To link your account, request a link code from the website and then send: /verify <code>');

            return response()->json(['ok' => true]);
        }

        // Default fallback
        $this->reply($chatId, 'Unrecognized command. Use /start for help.');

        return response()->json(['ok' => true]);
    }

    protected function reply($chatId, $text)
    {
        try {
            app()->make(\App\Services\TelegramService::class)->sendMessage((string) $chatId, $text);
        } catch (\Throwable $e) {
            // ignore
        }
    }
}
