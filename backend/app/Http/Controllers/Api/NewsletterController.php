<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function index()
    {
        return response()->json(
            NewsletterSubscriber::orderByDesc('created_at')->get()
        );
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        $existing = NewsletterSubscriber::where('email', $validated['email'])->first();
        if ($existing) {
            return response()->json([
                'message' => 'Bu e-posta adresi zaten bültenimize kayıtlı.',
                'subscribed' => true,
                'already_subscribed' => true,
            ], 200);
        }

        $subscriber = NewsletterSubscriber::create($validated);

        return response()->json([
            'message' => 'E-posta listenize başarıyla kaydedildiniz.',
            'subscribed' => true,
            'already_subscribed' => false,
        ], 201);
    }

    public function destroy(NewsletterSubscriber $subscriber)
    {
        $subscriber->delete();

        return response()->json(['message' => 'Abone listeden silindi.']);
    }
}