<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Enums\ToolDifficulty;
use App\Enums\ToolStatus;

final readonly class ToolData
{
    /**
     * @param  array<int>  $categoryIds
     * @param  array<string>  $tags
     * @param  array<int>  $roleIds
     * @param  array<string>  $screenshots
     */
    public function __construct(
        public string $name,
        public ?string $url = null,
        public ?string $docsUrl = null,
        public ?string $description = null,
        public ?string $usage = null,
        public ?string $examples = null,
        public ?ToolDifficulty $difficulty = null,
        public ?ToolStatus $status = null,
        public array $categoryIds = [],
        public array $tags = [],
        public array $roleIds = [],
        public array $screenshots = [],
    ) {
    }

    /**
     * Create from request data.
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'],
            url: $data['url'] ?? null,
            docsUrl: $data['docs_url'] ?? null,
            description: $data['description'] ?? null,
            usage: $data['usage'] ?? null,
            examples: $data['examples'] ?? null,
            difficulty: isset($data['difficulty'])
                ? ToolDifficulty::from($data['difficulty'])
                : null,
            status: isset($data['status'])
                ? ToolStatus::from($data['status'])
                : null,
            categoryIds: $data['categories'] ?? [],
            tags: $data['tags'] ?? [],
            roleIds: $data['roles'] ?? [],
            screenshots: $data['screenshots'] ?? [],
        );
    }

    /**
     * Convert to array for database operations.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = [
            'name' => $this->name,
            'url' => $this->url,
            'docs_url' => $this->docsUrl,
            'description' => $this->description,
            'usage' => $this->usage,
            'examples' => $this->examples,
            'screenshots' => $this->screenshots,
        ];

        if ($this->difficulty !== null) {
            $data['difficulty'] = $this->difficulty->value;
        }

        if ($this->status !== null) {
            $data['status'] = $this->status->value;
        }

        return $data;
    }
}
