<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'categories';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_featured',
        'show_in_navbar',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'show_in_navbar' => 'boolean',
        ];
    }

    public function news(): HasMany
    {
        return $this->hasMany(News::class, 'category_id', 'id');
    }
}