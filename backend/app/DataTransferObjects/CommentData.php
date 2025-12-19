<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

final readonly class CommentData
{
    public function __construct(
        public int $toolId,
        public int $userId,
        public string $content,
        public ?int $parentId = null,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromRequest(array $data): self
    {
        return new self(
            toolId: (int) $data['tool_id'] ?? 0,
            userId: (int) $data['user_id'] ?? 0,
            content: $data['content'] ?? '',
            parentId: isset($data['parent_id']) ? (int) $data['parent_id'] : null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'tool_id' => $this->toolId,
            'user_id' => $this->userId,
            'content' => $this->content,
            'parent_id' => $this->parentId,
        ];
    }
}
