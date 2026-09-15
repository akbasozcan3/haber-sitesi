"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { ApiError, authorsApi, newsApi } from "@/lib/istemci";
import type { Author, News, Id } from "@/types/uygulama";
import { PlusCircle, Search, Edit3, Trash2, ExternalLink, AlertCircle, Loader2, Mail, UserRound } from "lucide-react";

export default function AuthorsPage() {
  const [items, setItems] = useState<Author[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Id | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([authorsApi.list(), newsApi.list()])
      .then(([a, n]) => { setItems(a); setNews(n); })
      .catch(e => setError(e instanceof ApiError ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  async function remove(item: Author) {
    if (!window.confirm(`"${item.name}" adlı yazarı silmek istediğinize emin misiniz?`)) return;
    setDeleting(item.id);
    setError("");
    try {
      await authorsApi.remove(item.id);
      setItems(p => p.filter(e => e.id !== item.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bu yazara bağlı haberler var.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <YonetimKabugu>
      <div className="space-y-6">

        {/* BAŞLIK */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Editöryal Kadro
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Yazar Yönetimi</h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">{loading ? "Yükleniyor..." : `${items.length} kayıtlı yazar`}</p>
          </div>
          <Link
            href="/admin/authors/create"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-red-500" />
            <span>Yeni Yazar Ekle</span>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ARAMA */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Yazar adı veya e-posta ile ara..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none shadow-xs transition-colors"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto" />
            <p className="mt-3 text-xs text-slate-400">Yazarlar yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
            <UserRound className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-sm font-bold text-slate-700">Yazar bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const authorNews = news.filter(n => n.author_id === item.id);
              const count = authorNews.length;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {item.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.avatar} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-900 font-bold text-white text-sm">
                            {item.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span>{item.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/yazar/${item.slug}`}
                        target="_blank"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Profilini Gör"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/admin/authors/${item.id}/edit`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Düzenle"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        disabled={deleting === item.id}
                        onClick={() => remove(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {item.bio && (
                    <p className="mt-3 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {item.bio}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{count} makale</span>
                    <Link
                      href={`/admin/news?author=${item.slug}`}
                      className="font-bold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Haberlerini Gör &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </YonetimKabugu>
  );
}
