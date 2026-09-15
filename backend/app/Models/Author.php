<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Author extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'authors';

    protected $fillable = [
        'name',
        'slug',
        'email',
        'bio',
        'avatar',
    ];

    public function news(): HasMany
    {
        return $this->hasMany(News::class, 'author_id', 'id');
    }
}