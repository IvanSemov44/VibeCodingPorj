<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Category
 *
 * @property-read mixed $id
 * @property-read mixed $name
 * @property-read mixed $slug
 * @property-read mixed $description
 * @property-read mixed $created_at
 * @property-read mixed $updated_at
 * @property-read mixed $tools_count
 */
class CategoryResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'tools_count' => $this->when(isset($this->tools_count), $this->tools_count),
        ];
    }
}
