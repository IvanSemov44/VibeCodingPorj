<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

final readonly class JournalEntryData
{
    public function __construct(
        public int $userId,
        public string $title,
        public string $content,
        public ?string $mood = null,
        public ?array $tags = null,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromRequest(array $data): self
    {
        return new self(
            userId: (int) $data['user_id'] ?? 0,
            title: $data['title'] ?? '',
            content: $data['content'] ?? '',
            mood: $data['mood'] ?? null,
            tags: isset($data['tags']) ? (array) $data['tags'] : null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'title' => $this->title,
            'content' => $this->content,
            'mood' => $this->mood,
        ];
    }
}
