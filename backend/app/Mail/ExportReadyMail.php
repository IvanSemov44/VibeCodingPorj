<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ExportReadyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        protected User $user,
        protected string $filename,
        protected string $path
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Activity Log Export is Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.export-ready',
            with: [
                'user' => $this->user,
                'filename' => $this->filename,
                'path' => $this->path,
                'downloadUrl' => route('admin.exports.download', ['filename' => $this->filename]),
                'expiresAt' => now()->addDays(7)->format('Y-m-d H:i'),
            ],
        );
    }
}
