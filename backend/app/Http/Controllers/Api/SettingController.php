<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json([
            'settings' => Setting::getAll(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'site_logo' => 'nullable|string',
            'site_logo_type' => 'nullable|in:image,text',
            'site_logo_height' => 'nullable|integer|min:20|max:120',
            'site_favicon' => 'nullable|string',
            'site_title' => 'nullable|string|max:100',
            'site_tagline' => 'nullable|string|max:255',
            'ads_enabled' => 'nullable|string',
            'adsense_client' => 'nullable|string|max:50',
            'adsense_slot_header' => 'nullable|string|max:50',
            'adsense_slot_billboard' => 'nullable|string|max:50',
            'adsense_slot_sidebar' => 'nullable|string|max:50',
            'adsense_slot_article' => 'nullable|string|max:50',
            'ad_mode' => 'nullable|string|in:auto,demo,sponsor,adsense',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, (string) ($value ?? ''));
        }

        return response()->json([
            'message' => 'Site ayarları başarıyla güncellendi.',
            'settings' => Setting::getAll(),
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|file|mimes:jpg,jpeg,png,webp,svg|max:5120',
        ]);

        $file = $request->file('logo');
        $extension = $file->getClientOriginalExtension();
        $filename = 'logo_' . time() . '.' . $extension;
        $path = $file->storeAs('logos', $filename, 'public');

        $baseUrl = rtrim((string) config('filesystems.disks.public.url'), '/');
        $url = $baseUrl . '/' . ltrim($path, '/');

        Setting::set('site_logo', $url);
        Setting::set('site_logo_type', 'image');

        return response()->json([
            'message' => 'Logo başarıyla yüklendi ve güncellendi.',
            'url' => $url,
            'settings' => Setting::getAll(),
        ], 200);
    }

    public function uploadFavicon(Request $request)
    {
        $request->validate([
            'favicon' => 'required|file|mimes:ico,png,svg,webp,jpg,jpeg|max:2048',
        ]);

        $file = $request->file('favicon');
        $extension = $file->getClientOriginalExtension();
        $filename = 'favicon_' . time() . '.' . $extension;
        $path = $file->storeAs('logos', $filename, 'public');

        $baseUrl = rtrim((string) config('filesystems.disks.public.url'), '/');
        $url = $baseUrl . '/' . ltrim($path, '/');

        Setting::set('site_favicon', $url);

        return response()->json([
            'message' => 'Favicon başarıyla yüklendi ve güncellendi.',
            'url' => $url,
            'settings' => Setting::getAll(),
        ], 200);
    }
}
