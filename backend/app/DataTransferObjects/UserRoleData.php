<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

final readonly class UserRoleData
{
    public function __construct(
        public int $userId,
        public array $roles,
    ) {}

    /**
     * Create a DTO from request data.
     *
     * @param array<string, mixed> $data
     * @return self
     */
    public static function fromRequest(array $data): self
    {
        return new self(
            userId: (int) $data['user_id'],
            roles: (array) $data['roles'],
        );
    }

    /**
     * Convert to array representation.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'roles' => $this->roles,
        ];
    }
}
