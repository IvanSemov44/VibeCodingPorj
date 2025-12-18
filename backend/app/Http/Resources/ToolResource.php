<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Tool
 *
 * @property-read mixed $id
 * @property-read mixed $name
 * @property-read mixed $slug
 * @property-read mixed $url
 * @property-read mixed $docs_url
 * @property-read mixed $description
 * @property-read mixed $usage
 * @property-read mixed $examples
 * @property-read mixed $difficulty
 * @property-read mixed $screenshots
 * @property-read mixed $categories
 * @property-read mixed $tags
 * @property-read mixed $roles
 * @property-read mixed $created_at
 * @property-read mixed $updated_at
 */
class ToolResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'url' => $this->url,
            'docs_url' => $this->docs_url,
            'description' => $this->description,
            'usage' => $this->usage,
            'examples' => $this->examples,
            'difficulty' => $this->difficulty,
            'screenshots' => $this->screenshots,
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map->only(['id', 'name', 'slug'])),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map->only(['id', 'name', 'slug'])),
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map->only(['id', 'name'])),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ]),
            'status' => $this->status->value ?? null,
            // @phpstan-ignore-next-line - rejection_reason is a dynamic property
            'rejection_reason' => $this->when(isset($this->rejection_reason), fn () => $this->rejection_reason),
            'average_rating' => $this->average_rating ? (float) $this->average_rating : null,
            'rating_count' => $this->rating_count ?? 0,
            'user_rating' => $this->whenLoaded('userRating', fn () => [
                'score' => $this->userRating?->score,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
