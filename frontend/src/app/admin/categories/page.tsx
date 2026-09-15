"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { ApiError, categoriesApi, newsApi } from "@/lib/istemci";
import type { Category, News, Id } from "@/types/uygulama";
import { PlusCircle, Search, Edit3, Trash2, Folder, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Id | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([categoriesApi.list(), newsApi.list()])
      .then(([c, n]) => { setItems(c); setNews(n); })
      .catch(e => setError(e instanceof ApiError ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  async function remove(item: Category) {
    if (!window.confirm(`"${item.name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setDeleting(item.id);
    setError("");
    try {
      await categoriesApi.remove(item.id);
      setItems(p => p.filter(e => e.id !== item.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bu kategoriye bağlı haberler var.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <YonetimKabugu>
      <div className="space-y-6">

        {/* BAŞLIK */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              İçerik Organizasyonu
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kategori Yönetimi</h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">{loading ? "Yükleniyor..." : `${items.length} kayıtlı kategori`}</p>
          </div>
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-red-500" />
            <span>Yeni Kategori Ekle</span>
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
            placeholder="Kategori adı veya slug ile ara..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none shadow-xs transition-colors"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto" />
            <p className="mt-3 text-xs text-slate-400">Kategoriler yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
            <Folder className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-sm font-bold text-slate-700">Kategori bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const count = news.filter(n => n.category_id === item.id).length;
              const published = news.filter(n => n.category_id === item.id && n.status === "published").length;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
                >
                  {/* Üst */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">/kategori/{item.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/kategori/${item.slug}`}
                        target="_blank"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Sitede Gör"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/admin/categories/${item.id}/edit`}
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

                  {/* İstatistik Çubuğu */}
                  <div className="flex items-center gap-3 pt-3.5 mt-4 border-t border-slate-100">
                    <div className="flex-1">
                      <p className="text-base font-black text-slate-900 tabular-nums">{count}</p>
                      <p className="text-[10px] font-medium text-slate-400">toplam</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-emerald-600 tabular-nums">{published}</p>
                      <p className="text-[10px] font-medium text-slate-400">yayında</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-amber-600 tabular-nums">{count - published}</p>
                      <p className="text-[10px] font-medium text-slate-400">taslak</p>
                    </div>
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
