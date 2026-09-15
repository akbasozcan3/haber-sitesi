"use client";

import { useEffect, useState } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { commentsApi, ApiError } from "@/lib/istemci";
import type { Comment, Id } from "@/types/uygulama";
import {
  MessageSquare, Trash2, Search, AlertCircle, Loader2,
  CheckCircle2, XCircle, ThumbsUp, ExternalLink,
} from "lucide-react";
import Link from "next/link";

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<Id | null>(null);

  function load() {
    setLoading(true);
    setError("");
    const params: { status?: string; search?: string } = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    commentsApi
      .listAll(params)
      .then((res) => {
        setComments(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yorumlar yüklenemedi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function toggleStatus(id: Id) {
    setActionId(id);
    try {
      const res = await commentsApi.toggle(id);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: res.comment.is_approved } : c))
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Durum güncellenemedi.");
    } finally {
      setActionId(null);
    }
  }

  async function remove(id: Id) {
    if (!window.confirm("Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setActionId(id);
    try {
      await commentsApi.remove(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Yorum silinemedi.");
    } finally {
      setActionId(null);
    }
  }

  const filtered = comments.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.content.toLowerCase().includes(s) ||
      c.news?.title.toLowerCase().includes(s)
    );
  });

  return (
    <YonetimKabugu>
      <div className="space-y-6">
        {/* Üst Başlık */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              İçerik & Topluluk
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Yorumlar & Moderasyon</h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Okuyuculardan gelen haber yorumlarını yönetin, onaylayın veya silin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "approved" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Onaylı
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "pending" ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Onay Bekleyen
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Arama */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Yorumlarda veya haberlerde ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        {/* Yorum Tablosu */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">
                {search ? "Aramanızla eşleşen yorum bulunamadı." : "Henüz yorum kaydı bulunmuyor."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Okuyucu</th>
                    <th className="px-5 py-3.5">Yorum İçeriği</th>
                    <th className="px-5 py-3.5">İlgili Haber</th>
                    <th className="px-5 py-3.5 text-center">Beğeni</th>
                    <th className="px-5 py-3.5">Tarih</th>
                    <th className="px-5 py-3.5 text-center">Durum</th>
                    <th className="px-5 py-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((comment) => (
                    <tr key={comment.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {comment.name}
                      </td>
                      <td className="px-5 py-4 text-slate-700 max-w-xs sm:max-w-md">
                        <p className="line-clamp-2 leading-relaxed">{comment.content}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs">
                        {comment.news ? (
                          <Link
                            href={`/haberler/${comment.news.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-red-600 transition-colors line-clamp-1"
                          >
                            <span className="truncate">{comment.news.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">Silinmiş Haber</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                          <ThumbsUp className="h-3 w-3 text-slate-400" />
                          {comment.likes || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(comment.created_at)}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(comment.id)}
                          disabled={actionId === comment.id}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            comment.is_approved
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {comment.is_approved ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Onaylı</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-amber-600" />
                              <span>Onay Bekliyor</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => remove(comment.id)}
                          disabled={actionId === comment.id}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer disabled:opacity-40"
                          title="Yorumu Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </YonetimKabugu>
  );
}
