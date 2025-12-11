<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwoFactorChallenge extends Model
{
    use HasFactory;

    protected $table = 'two_factor_challenges';

    protected $fillable = [
        'user_id',
        'code',
        'type',
        'used',
        'expires_at',
    ];

    protected $casts = [
        'used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
