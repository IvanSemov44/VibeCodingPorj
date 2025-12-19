<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class SearchSuggestion extends Model
{
    protected $table = 'search_suggestions';

    protected $fillable = [
        'keyword',
        'type',
        'search_count',
        'click_count',
        'popularity_score',
    ];

    protected $casts = [
        'search_count' => 'integer',
        'click_count' => 'integer',
        'popularity_score' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function incrementSearchCount(): void
    {
        $this->increment('search_count');
        $this->updatePopularityScore();
    }

    public function incrementClickCount(): void
    {
        $this->increment('click_count');
        $this->updatePopularityScore();
    }

    private function updatePopularityScore(): void
    {
        $searchWeight = 0.7;
        $clickWeight = 0.3;

        $this->popularity_score = ($this->search_count * $searchWeight) + ($this->click_count * $clickWeight);
        $this->save();
    }
}
