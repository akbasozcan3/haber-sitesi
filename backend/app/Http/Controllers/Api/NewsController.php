<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\NewsView;
use App\Models\Category;
use App\Models\Author;
use App\Http\Resources\NewsResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::with(['category', 'author']);
        $isAdmin = $request->user('sanctum')?->isAdmin() === true;

        if (! $isAdmin) {
            $nowStr = now()->toDateTimeString();
            $query->where('status', 'published')
                ->where(function ($publishedQuery) use ($nowStr) {
                    $publishedQuery->whereNull('published_at')
                        ->orWhere('published_at', '<=', $nowStr);
                });
        } elseif ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($category = $request->input('category')) {
            $query->where(function ($q) use ($category) {
                if (ctype_digit((string) $category)) {
                    $q->where('category_id', (int) $category);
                } else {
                    $q->whereHas('category', fn ($catQuery) => $catQuery->where('slug', $category));
                }
            });
        }

        if ($author = $request->input('author')) {
            $query->where(function ($q) use ($author) {
                if (ctype_digit((string) $author)) {
                    $q->where('author_id', (int) $author);
                } else {
                    $q->whereHas('author', fn ($authQuery) => $authQuery->where('slug', $author));
                }
            });
        }

        if ($request->has('featured') || $request->has('is_featured')) {
            $featuredVal = $request->input('featured', $request->input('is_featured'));
            if ($featuredVal !== null && $featuredVal !== '') {
                $query->where('is_featured', filter_var($featuredVal, FILTER_VALIDATE_BOOLEAN));
            }
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $sort = $request->input('sort', 'latest');
        if ($sort === 'popular') {
            $query->orderByDesc('views')->orderByDesc('published_at')->latest();
        } else {
            $query->latest('published_at')->latest();
        }

        $limit = min(max((int) $request->input('limit', 12), 1), 50);
        $news = $query->limit($limit)->get();

        return NewsResource::collection($news);
    }
    private function findNews($identifier)
    {
        if (is_numeric($identifier)) {
            $numId = (int) $identifier;
            $news = News::where('id', $numId)->first() ?? News::where('id', (string) $identifier)->first();
            if ($news) return $news;
        }

        if (is_string($identifier) && preg_match('/^[0-9a-fA-F]{24}$/', $identifier)) {
            $news = News::find($identifier);
            if ($news) return $news;
        }

        $news = News::where('slug', (string) $identifier)->first();
        if ($news) return $news;

        return News::where('id', $identifier)->first() ?? News::find($identifier);
    }

    public function show($identifier)
    {
        $news = $this->findNews($identifier);

        if (!$news) {
            abort(404, 'Haber bulunamadı.');
        }

        $isAdmin = request()->user('sanctum')?->isAdmin() === true;
        if (! $isAdmin) {
            if ($news->status !== 'published') {
                abort(404, 'Haber bulunamadı.');
            }
            $nowStr = now()->toDateTimeString();
            if ($news->published_at && $news->published_at > $nowStr) {
                abort(404, 'Haber bulunamadı.');
            }
        }

        return new NewsResource($news->load(['category', 'author']));
    }

    public function incrementView(Request $request, $identifier)
    {
        $news = $this->findNews($identifier);

        if (!$news || $news->status !== 'published') {
            abort(404, 'Haber bulunamadı.');
        }

        $nowStr = now()->toDateTimeString();
        if ($news->published_at && $news->published_at > $nowStr) {
            abort(404, 'Haber bulunamadı.');
        }

        $userAgent = (string) ($request->userAgent() ?? '');

        // 1) Arama motoru botlarını ve web tarayıcılarını filtrele
        if (preg_match('/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|curl|wget|python/i', $userAgent)) {
            return response()->json([
                'id' => $news->id,
                'views' => (int) $news->views,
                'status' => 'bot_ignored',
                'counted' => false
            ]);
        }

        // 2) İstemcinin benzersiz cihaz kimliği (localStorage UUID) ve IP parmak izi
        $visitorId = trim((string) ($request->input('visitor_id') ?: $request->header('X-Visitor-Id', '')));
        $ip = (string) ($request->ip() ?? '127.0.0.1');
        $ipUaHash = md5($ip . '|' . $userAgent);

        // 3) Hızlı önbellek (Cache) kontrolü
        $cacheKeyVisitor = !empty($visitorId) ? "viewed_news_{$news->id}_{$visitorId}" : null;
        $cacheKeyIpUa = "viewed_news_{$news->id}_{$ipUaHash}";

        if (($cacheKeyVisitor && Cache::has($cacheKeyVisitor)) || Cache::has($cacheKeyIpUa)) {
            return response()->json([
                'id' => $news->id,
                'views' => (int) $news->views,
                'status' => 'already_viewed',
                'counted' => false
            ]);
        }

        // 4) Veritabanı (MongoDB) kalıcı tekillik kontrolü (aynı cihaz/tarayıcı veya aynı IP+UA)
        $alreadyViewed = false;
        if (!empty($visitorId)) {
            $alreadyViewed = NewsView::where('news_id', $news->id)
                ->where(function ($q) use ($visitorId, $ipUaHash) {
                    $q->where('visitor_id', $visitorId)
                      ->orWhere('ip_ua_hash', $ipUaHash);
                })
                ->exists();
        } else {
            $alreadyViewed = NewsView::where('news_id', $news->id)
                ->where('ip_ua_hash', $ipUaHash)
                ->exists();
        }

        if ($alreadyViewed) {
            if ($cacheKeyVisitor) Cache::put($cacheKeyVisitor, true, now()->addDays(30));
            Cache::put($cacheKeyIpUa, true, now()->addDays(30));

            return response()->json([
                'id' => $news->id,
                'views' => (int) $news->views,
                'status' => 'already_viewed',
                'counted' => false
            ]);
        }

        // 5) Gerçek ve yeni ziyaretçi: Sayacı 1 artır ve cihazı kaydet
        $news->increment('views');

        NewsView::create([
            'news_id' => $news->id,
            'visitor_id' => !empty($visitorId) ? $visitorId : null,
            'ip' => $ip,
            'ip_ua_hash' => $ipUaHash,
            'user_agent' => substr($userAgent, 0, 255),
            'viewed_at' => now(),
        ]);

        if ($cacheKeyVisitor) Cache::put($cacheKeyVisitor, true, now()->addDays(30));
        Cache::put($cacheKeyIpUa, true, now()->addDays(30));

        return response()->json([
            'id' => $news->id,
            'views' => (int) $news->fresh()->views,
            'status' => 'success',
            'counted' => true
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', function ($attribute, $value, $fail) {
                if (!Category::find($value)) {
                    $fail('The selected category id is invalid.');
                }
            }],
            'author_id' => ['required', function ($attribute, $value, $fail) {
                if (!Author::find($value)) {
                    $fail('The selected author id is invalid.');
                }
            }],
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|string|max:255',
            'inner_image' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published',
            'is_featured' => 'boolean',
            'views' => 'nullable|integer|min:0',
            'published_at' => 'nullable|date',
        ]);

        if (!isset($validated['views'])) {
            $validated['views'] = 0;
        }

        $news = News::create($validated);

        return (new NewsResource($news->load(['category', 'author'])))->response()->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);

        $validated = $request->validate([
            'category_id' => ['sometimes', 'required', function ($attribute, $value, $fail) {
                if (!Category::find($value)) {
                    $fail('The selected category id is invalid.');
                }
            }],
            'author_id' => ['sometimes', 'required', function ($attribute, $value, $fail) {
                if (!Author::find($value)) {
                    $fail('The selected author id is invalid.');
                }
            }],
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:news,slug,' . $news->id,
            'excerpt' => 'nullable|string',
            'content' => 'sometimes|required|string',
            'image' => 'nullable|string|max:255',
            'inner_image' => 'nullable|string|max:500',
            'status' => 'sometimes|required|in:draft,published',
            'is_featured' => 'boolean',
            'views' => 'nullable|integer|min:0',
            'published_at' => 'nullable|date',
        ]);

        $news->update($validated);

        if (array_key_exists('views', $validated) && (int) $validated['views'] === 0) {
            NewsView::where('news_id', $news->id)->delete();
        }

        return new NewsResource($news->load(['category', 'author']));
    }

    public function destroy($id)
    {
        $news = News::findOrFail($id);

        NewsView::where('news_id', $news->id)->delete();
        $news->delete();

        return response()->json([
            'message' => 'Haber başarıyla silindi.'
        ]);
    }
}