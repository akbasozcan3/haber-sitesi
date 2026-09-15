<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'newsletter_subscribers';

    protected $fillable = ['email'];
}