<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    private function findNews(string|int $newsIdentifier): ?News
    {
        if (is_numeric($newsIdentifier)) {
            $numId = (int) $newsIdentifier;
            $news = News::where('id', $numId)->first() ?? News::where('id', (string) $newsIdentifier)->first();
            if ($news) return $news;
        }

        if (is_string($newsIdentifier) && preg_match('/^[0-9a-fA-F]{24}$/', $newsIdentifier)) {
            $news = News::find($newsIdentifier);
            if ($news) return $news;
        }

        $news = News::where('slug', (string) $newsIdentifier)->first();
        if ($news) return $news;

        return News::where('id', $newsIdentifier)->first() ?? News::find($newsIdentifier);
    }

    /**
     * Belirli bir habere ait onaylanmış yorumları listele.
     */
    public function indexForNews(string|int $newsIdentifier): JsonResponse
    {
        $news = $this->findNews($newsIdentifier);

        if (!$news) {
            return response()->json(['message' => 'Haber bulunamadı.'], 404);
        }

        $newsIdValues = array_values(array_filter(array_unique([
            $news->id,
            (string) $news->id,
            is_numeric($news->id) ? (int) $news->id : null,
            $news->_id ?? null
        ]), fn($v) => !is_null($v)));

        $comments = Comment::whereIn('news_id', $newsIdValues)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    /**
     * Habere yeni yorum ekle.
     */
    public function store(Request $request, string|int $newsIdentifier): JsonResponse
    {
        $news = $this->findNews($newsIdentifier);

        if (!$news) {
            return response()->json(['message' => 'Haber bulunamadı.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'content' => 'required|string|min:3|max:2000',
        ], [
            'name.required' => 'Lütfen adınızı soyadınızı girin.',
            'name.min' => 'Adınız en az 2 karakter olmalıdır.',
            'content.required' => 'Lütfen bir yorum yazın.',
            'content.min' => 'Yorumunuz en az 3 karakter olmalıdır.',
        ]);

        $newsId = is_numeric($news->id) ? (int) $news->id : $news->id;

        $comment = Comment::create([
            'news_id' => $newsId,
            'name' => trim(strip_tags($validated['name'])),
            'content' => trim(strip_tags($validated['content'])),
            'likes' => 0,
            'is_approved' => true,
        ]);

        return response()->json([
            'message' => 'Yorumunuz başarıyla yayınlandı.',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Yoruma beğeni ekle.
     */
    public function like(string|int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $comment->increment('likes');

        return response()->json([
            'message' => 'Beğenildi.',
            'likes' => $comment->likes,
        ]);
    }

    /**
     * Yönetim paneli: Tüm yorumları listele.
     */
    public function indexAll(Request $request): JsonResponse
    {
        $query = Comment::with('news')->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $comments = $query->paginate($request->input('per_page', 20));

        return response()->json($comments);
    }

    /**
     * Yönetim paneli: Yorum durumunu (onaylı/onaysız) değiştir.
     */
    public function toggleApproval(string|int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $comment->is_approved = !$comment->is_approved;
        $comment->save();

        return response()->json([
            'message' => $comment->is_approved ? 'Yorum onaylandı.' : 'Yorum onayı kaldırıldı.',
            'comment' => $comment,
        ]);
    }

    /**
     * Yönetim paneli: Yorumu sil.
     */
    public function destroy(string|int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Yorum başarıyla silindi.']);
    }
}
