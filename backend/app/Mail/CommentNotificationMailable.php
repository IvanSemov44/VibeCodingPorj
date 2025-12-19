<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class CommentNotificationMailable extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly Comment $comment,
        public readonly string $recipientType = 'owner', // 'owner' or 'parent_author'
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match ($this->recipientType) {
            'parent_author' => 'New reply to your comment',
            default => 'New comment on your tool',
        };

        return new Envelope(
            from: new Address(
                address: config('mail.from.address') ?? 'noreply@vibecoding.com',
                name: config('mail.from.name') ?? 'VibeCoding'
            ),
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $toolName = $this->comment->tool?->name ?? 'Tool';
        $toolUrl = config('app.url') . '/tools/' . $this->comment->tool_id;

        return new Content(
            view: 'emails.comment-notification',
            with: [
                'comment' => $this->comment,
                'toolName' => $toolName,
                'toolUrl' => $toolUrl,
                'recipientType' => $this->recipientType,
                'appName' => config('app.name'),
                'appUrl' => config('app.url'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
