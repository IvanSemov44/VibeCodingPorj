<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'url', 'docs_url', 'description', 'usage', 'examples', 'difficulty', 'screenshots',
    ];

    protected $casts = [
        'screenshots' => 'array',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_tool');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'tag_tool');
    }

    public function roles()
    {
        // Uses spatie/roles - many to many via role_tool
        return $this->belongsToMany(\Spatie\Permission\Models\Role::class, 'role_tool');
    }
}
