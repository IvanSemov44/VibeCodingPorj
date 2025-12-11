<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TwoFactorCode extends Notification
{
    use Queueable;

    public function __construct(public string $code) {}

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your verification code')
            ->line('Your two-factor verification code is:')
            ->line('**' . $this->code . '**')
            ->line('This code expires in 5 minutes.')
            ->line('If you did not request this code, please secure your account.');
    }
}
