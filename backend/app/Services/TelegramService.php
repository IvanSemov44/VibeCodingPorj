<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class TelegramService
{
    protected string $apiBase;

    public function __construct()
    {
        $token = config('telegram.bot_token');
        $this->apiBase = "https://api.telegram.org/bot{$token}";
    }

    public function sendMessage(string $chatId, string $text, array $options = []): array
    {
        $payload = array_merge(['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'Markdown'], $options);
        $res = Http::post($this->apiBase.'/sendMessage', $payload);

        return $res->json();
    }

    public function sendOtp(User $user, string $code): bool
    {
        if (empty($user->telegram_chat_id)) {
            return false;
        }

        $text = "🔐 Your verification code: *{$code}*\nThis code expires in 5 minutes.";
        $resp = $this->sendMessage($user->telegram_chat_id, $text);

        return isset($resp['ok']) && $resp['ok'] === true;
    }
}
