<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function image(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $path = $request->file('image')->store('news', 'public');

        return response()->json([
            'url' => rtrim((string) config('filesystems.disks.public.url'), '/') . '/' . ltrim($path, '/'),
            'path' => $path,
        ], 201);
    }
}