<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Setting extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'settings';

    protected $fillable = ['key', 'value', 'group'];

    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set(string $key, $value, string $group = 'general'): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }

    public static function getAll(): array
    {
        $defaults = [
            'site_logo' => '',
            'site_logo_type' => 'text',
            'site_logo_height' => '48',
            'site_favicon' => '',
            'site_title' => 'Zernews',
            'site_tagline' => 'Teknoloji ve Girişim Ekosistemi',
            'ads_enabled' => '1',
            'adsense_client' => 'ca-pub-4161709832087107',
            'adsense_slot_header' => '',
            'adsense_slot_billboard' => '',
            'adsense_slot_sidebar' => '',
            'adsense_slot_article' => '',
            'ad_mode' => 'auto',
        ];

        $stored = static::all()->pluck('value', 'key')->toArray();

        return array_merge($defaults, $stored);
    }
}
