<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Tool> $tools
 */
class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    public function tools()
    {
        return $this->belongsToMany(Tool::class, 'tag_tool');
    }
}
