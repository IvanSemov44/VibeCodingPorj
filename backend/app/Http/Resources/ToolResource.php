<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

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
            'categories' => $this->whenLoaded('categories', fn() => $this->categories->map->only(['id','name','slug'])),
            'tags' => $this->whenLoaded('tags', fn() => $this->tags->map->only(['id','name','slug'])),
            'roles' => $this->whenLoaded('roles', fn() => $this->roles->map->only(['id','name'])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
