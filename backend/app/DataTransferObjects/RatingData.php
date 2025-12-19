<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

final readonly class RatingData
{
    public function __construct(
        public int $toolId,
        public int $userId,
        public int $score,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromRequest(array $data): self
    {
        return new self(
            toolId: (int) $data['tool_id'] ?? 0,
            userId: (int) $data['user_id'] ?? 0,
            score: (int) $data['score'] ?? 0,
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
            'score' => $this->score,
        ];
    }
}
