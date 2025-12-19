<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class SearchFilter extends Model
{
    protected $table = 'search_filters';

    protected $fillable = [
        'name',
        'slug',
        'filter_type',
        'options',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function byType(string $type): array
    {
        return static::where('filter_type', $type)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->toArray();
    }

    public function getOptions(): array
    {
        return $this->options ?? [];
    }
}
