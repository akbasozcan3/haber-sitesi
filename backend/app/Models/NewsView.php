<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class NewsView extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'news_views';

    protected $fillable = [
        'news_id',
        'visitor_id',
        'ip',
        'ip_ua_hash',
        'user_agent',
        'viewed_at',
    ];

    protected $casts = [
        'news_id' => 'integer',
        'viewed_at' => 'datetime',
    ];
}
