<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AnalyticsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'period' => $this->period,
            'metric' => $this->metric,
            'value' => $this->value,
            'change_percentage' => $this->change_percentage,
            'data' => $this->data ?? [],
        ];
    }
}
