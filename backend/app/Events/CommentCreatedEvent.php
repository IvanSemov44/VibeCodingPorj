<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Comment;
use App\Models\Tool;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class CommentCreatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Comment $comment,
        public readonly Tool $tool,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('tool.' . $this->tool->id);
    }

    public function broadcastAs(): string
    {
        return 'comment.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->comment->id,
            'content' => $this->comment->content,
            'user_id' => $this->comment->user_id,
            'user_name' => $this->comment->user->name,
            'tool_id' => $this->tool->id,
            'tool_name' => $this->tool->name,
            'created_at' => $this->comment->created_at->toIso8601String(),
        ];
    }
}
