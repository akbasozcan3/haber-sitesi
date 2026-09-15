"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { ApiError, newsApi, categoriesApi } from "@/lib/istemci";
import type { News, Category, Id } from "@/types/uygulama";
import {
  PlusCircle, Search, Edit3, Trash2,
  AlertCircle, ChevronLeft, ChevronRight, Filter, Eye,
} from "lucide-react";

const PAGE_SIZE = 15;

function NewsThumbnail({ src, alt, category }: { src?: string | null; alt: string; category?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-400 select-none border border-neutral-200/60">
        {category ? category.slice(0, 3).toUpperCase() : "IMG"}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Id | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    Promise.all([newsApi.list(), categoriesApi.list()])
      .then(([n, c]) => {
        if (active) {
          setItems(n);
          setCategories(c);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof ApiError ? e.message : "Haberler yüklenemedi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function remove(item: News) {
    if (!window.confirm(`"${item.title}" başlıklı haberi silmek istediğinize emin misiniz?`)) return;
    setDeleting(item.id);
    setError("");
    try {
      await newsApi.remove(item.id);
      setItems(p => p.filter(e => e.id !== item.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Haber silinemedi.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = search.trim().toLowerCase();
      const matchQ = !q || item.title.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
      const matchS = status === "all" || item.status === status;
      const matchC = category === "all" || String(item.category_id) === category;
      return matchQ && matchS && matchC;
    });
  }, [items, search, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visiblePage = Math.min(page, totalPages);
  const paged = filtered.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  const publishedCount = items.filter(n => n.status === "published").length;
  const draftCount = items.filter(n => n.status === "draft").length;

  return (
    <YonetimKabugu>
      <div className="space-y-6">

        {/* SAYFA BAŞLIĞI */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              İçerik Yönetimi
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Haber Yönetimi
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              {loading ? (
                "Veriler yükleniyor..."
              ) : (
                <>
                  <span className="font-bold text-slate-900">{items.length}</span> haber &middot;{" "}
                  <span className="font-bold text-emerald-600">{publishedCount}</span> yayında &middot;{" "}
                  <span className="font-bold text-amber-600">{draftCount}</span> taslak
                </>
              )}
            </p>
          </div>

          <Link
            href="/admin/news/create"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4 text-red-500" />
            <span>Yeni Haber Ekle</span>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* FİLTRE VE ARAMA KUTUSU */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Başlık veya slug ile ara..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />

            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="published">Yayında Olanlar</option>
              <option value="draft">Taslaklar</option>
            </select>

            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLO */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Haber</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Yazar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-center">Görüntülenme</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Haberler yükleniyor...
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Kriterlere uygun haber bulunamadı.
                    </td>
                  </tr>
                ) : (
                  paged.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* GÖRSEL & BAŞLIK */}
                      <td className="px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <NewsThumbnail
                            src={item.image}
                            alt={item.title}
                            category={item.category?.name}
                          />
                          <div className="min-w-0 max-w-md">
                            <Link
                              href={`/admin/news/${item.id}/edit`}
                              className="font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="truncate max-w-[200px]">{item.slug}</span>
                              {item.is_featured && (
                                <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-700 border border-amber-200">
                                  Öne Çıkan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORİ */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {item.category?.name ?? "Kategorisiz"}
                        </span>
                      </td>

                      {/* YAZAR */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                        {item.author?.name ?? "Editör"}
                      </td>

                      {/* DURUM */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.status === "published" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Taslak
                          </span>
                        )}
                      </td>

                      {/* TARİH */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Intl.DateTimeFormat("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(item.published_at || item.created_at || 0))}
                      </td>

                      {/* GÖRÜNTÜLENME */}
                      <td className="px-4 py-3 whitespace-nowrap text-center font-bold tabular-nums text-slate-700">
                        {item.views ?? 0}
                      </td>

                      {/* İŞLEM BUTONLARI */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "published" && (
                            <Link
                              href={`/haberler/${item.slug}`}
                              target="_blank"
                              title="Sitede Görüntüle"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}

                          <Link
                            href={`/admin/news/${item.id}/edit`}
                            title="Düzenle"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => remove(item)}
                            disabled={deleting === item.id}
                            title="Sil"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SAYFALAMA */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
              <span className="text-xs text-slate-500">
                Toplam <span className="font-bold text-slate-900">{filtered.length}</span> kayıttan{" "}
                <span className="font-bold text-slate-900">{(visiblePage - 1) * PAGE_SIZE + 1}</span> -{" "}
                <span className="font-bold text-slate-900">{Math.min(visiblePage * PAGE_SIZE, filtered.length)}</span> arası
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={visiblePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-bold text-slate-700">
                  {visiblePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={visiblePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </YonetimKabugu>
  );
}
