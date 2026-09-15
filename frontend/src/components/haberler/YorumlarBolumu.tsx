"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, CheckCircle2, User, Loader2 } from "lucide-react";
import { commentsApi } from "@/lib/istemci";
import type { Comment } from "@/types/uygulama";

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Az önce";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dakika önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} gün önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" }).format(new Date(dateString));
}

export default function YorumlarBolumu({ newsId }: { newsId: number | string; newsTitle?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<(number | string)[]>([]);

  useEffect(() => {
    let active = true;

    commentsApi
      .listForNews(newsId)
      .then((data) => {
        if (active) {
          setComments(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) setComments([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [newsId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !commentText.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await commentsApi.create(newsId, {
        name: name.trim(),
        content: commentText.trim(),
      });

      if (res?.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setName("");
        setCommentText("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(id: number | string) {
    if (likedIds.includes(id)) return;
    setLikedIds((prev) => [...prev, id]);

    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );

    try {
      await commentsApi.like(id);
    } catch {
      // Revert if error
      setLikedIds((prev) => prev.filter((i) => i !== id));
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: Math.max(0, (c.likes || 0) - 1) } : c))
      );
    }
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8">
      {/* Bölüm Başlığı */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="h-5 w-5 text-red-600" />
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Yorumlar ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Düşüncelerinizi paylaşın
        </span>
      </div>

      {/* Yorum Ekleme Formu */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6">
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Bir Yorum Yazın
        </h4>

        {submitted && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Yorumunuz başarıyla yayınlandı. Katkınız için teşekkür ederiz!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <div>
            <input
              type="text"
              placeholder="Adınız Soyadınız"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-neutral-900 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mb-3">
          <textarea
            placeholder="Haber hakkındaki görüşlerinizi yazın..."
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            maxLength={2000}
            disabled={submitting}
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-neutral-900 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !commentText.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-600 active:scale-95 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <span>Yorumu Gönder</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Yorum Listesi */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-white p-4 animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-500">Bu habere henüz yorum yapılmamış.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">İlk yorumu siz yazarak tartışmayı başlatın!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isLiked = likedIds.includes(comment.id);
            return (
              <div key={comment.id} className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{comment.name}</span>
                      <span className="block text-[10px] text-slate-400">{formatRelativeTime(comment.created_at)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      isLiked
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mt-2 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
