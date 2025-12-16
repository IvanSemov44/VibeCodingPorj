<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\JournalEntry
 *
 * @property-read mixed $id
 * @property-read mixed $user_id
 * @property-read mixed $title
 * @property-read mixed $content
 * @property-read mixed $mood
 * @property-read mixed $tags
 * @property-read mixed $is_private
 * @property-read mixed $created_at
 * @property-read mixed $updated_at
 */
class JournalEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'content' => $this->content,
            'mood' => $this->mood,
            'tags' => $this->tags,
            'is_private' => $this->is_private ?? true,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
