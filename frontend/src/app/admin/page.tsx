"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { newsApi, categoriesApi, authorsApi, newsletterApi, commentsApi } from "@/lib/istemci";
import type { News, Category, Author } from "@/types/uygulama";
import {
  Newspaper, Eye, Folder, TrendingUp,
  PlusCircle, ArrowRight, Clock,
  CheckCircle, FileText, Zap, Mail, MessageSquare, UserRound,
} from "lucide-react";

function formatRelativeTime(d: string | null | undefined): string {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-red-600 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-400 w-8 text-right tabular-nums">{pct}%</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      newsApi.list(),
      categoriesApi.list(),
      authorsApi.list(),
      newsletterApi.list().catch(() => []),
      commentsApi.listAll().catch(() => ({ data: [], total: 0 })),
    ])
      .then(([n, c, a, sub, com]) => {
        setNews(n);
        setCategories(c);
        setAuthors(a);
        setSubscriberCount(sub.length);
        setCommentCount(com?.total ?? com?.data?.length ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = news.filter(n => n.status === "published");
  const drafts = news.filter(n => n.status === "draft");
  const featured = news.filter(n => n.is_featured);
  const totalViews = news.reduce((s, n) => s + (n.views || 0), 0);
  const maxViews = Math.max(...news.map(n => n.views || 0), 1);

  const recentNews = [...news]
    .sort((a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime())
    .slice(0, 6);

  const popularNews = [...news]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const stats = [
    { label: "Toplam Haber", value: news.length, sub: `${drafts.length} taslak`, icon: Newspaper, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", href: "/admin/news" },
    { label: "Yayındaki", value: published.length, sub: `%${news.length > 0 ? Math.round(published.length / news.length * 100) : 0} yayında`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", href: "/admin/news" },
    { label: "Görüntülenme", value: totalViews.toLocaleString("tr-TR"), sub: `${featured.length} öne çıkan`, icon: Eye, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", href: "/admin/news" },
    { label: "Okuyucu Yorumu", value: commentCount, sub: "topluluk katkısı", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", href: "/admin/comments" },
    { label: "Yazarlar", value: authors.length, sub: "editör kadrosu", icon: UserRound, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", href: "/admin/authors" },
    { label: "Bülten Aboneleri", value: subscriberCount, sub: "kayıtlı e-posta", icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", href: "/admin/newsletter" },
  ];

  return (
    <YonetimKabugu>
      <div className="space-y-7">

        {/* BAŞLIK */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Genel Bakış
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Kontrol Paneli
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Zernews medya portalı istatistikleri ve yönetim merkezi
            </p>
          </div>

          <Link
            href="/admin/news/create"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-red-500" />
            <span>Yeni Haber Yaz</span>
          </Link>
        </div>

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse" />
              ))
            : stats.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border ${s.border} bg-white p-4 transition-[box-shadow,border-color] duration-200 hover:shadow-md`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} mb-3`}>
                      <Icon className={`h-4.5 w-4.5 ${s.color}`} />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</span>
                    <span className="mt-0.5 text-xs font-bold text-slate-700">{s.label}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{s.sub}</span>
                  </Link>
                );
              })}
        </div>

        {/* ORTA BÖLÜM */}
        <div className="grid gap-5 lg:grid-cols-12">

          {/* SON HABERLER */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-black text-slate-900">Son Eklenen Haberler</h2>
              </div>
              <Link
                href="/admin/news"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 px-5 py-3.5 animate-pulse">
                      <div className="h-12 w-16 rounded-lg bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-4/5 rounded bg-slate-100" />
                        <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))
                : recentNews.length === 0
                ? <div className="p-10 text-center text-xs text-slate-400">Henüz haber eklenmemiş.</div>
                : recentNews.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shadow-2xs">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400"><FileText className="h-4 w-4" /></div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/news/${item.id}/edit`}
                          className="block truncate text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                            <Folder className="h-2.5 w-2.5" />
                            {item.category?.name || "Kategorisiz"}
                          </span>
                          <span>·</span>
                          <span>{formatRelativeTime(item.published_at || item.created_at)}</span>
                          <span>·</span>
                          <span className="tabular-nums font-medium">{(item.views || 0).toLocaleString("tr-TR")} okunma</span>
                        </div>
                      </div>

                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {item.status === "published" ? "Yayında" : "Taslak"}
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          {/* SAĞ KOLON */}
          <div className="lg:col-span-5 space-y-5">

            {/* POPÜLER HABERLER */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900">Çok Okunanlar</h2>
              </div>
              <div className="p-4 space-y-3.5">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-1.5 animate-pulse">
                        <div className="h-2.5 w-3/4 rounded bg-slate-100" />
                        <div className="h-1.5 rounded-full bg-slate-100" />
                      </div>
                    ))
                  : popularNews.length === 0
                  ? <p className="text-xs text-slate-400 text-center py-4">Henüz haber yok.</p>
                  : popularNews.map((item, idx) => (
                      <div key={item.id} className="group">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                            idx === 0 ? "bg-amber-100 text-amber-800" :
                            idx === 1 ? "bg-slate-200 text-slate-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>{idx + 1}</span>

                          <Link
                            href={`/admin/news/${item.id}/edit`}
                            className="flex-1 truncate text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors"
                          >
                            {item.title}
                          </Link>

                          <span className="text-[11px] font-bold tabular-nums text-slate-500 shrink-0">
                            {(item.views || 0).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        {(item.views || 0) > 0 ? (
                          <MiniBar value={item.views || 0} max={maxViews} />
                        ) : (
                          <span className="text-[10px] text-slate-400">Henüz okunma yok</span>
                        )}
                      </div>
                    ))}
              </div>
            </div>

            {/* HIZLI İŞLEMLER */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
                <Zap className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-black text-slate-900">Hızlı İşlemler</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[
                  { href: "/admin/news/create", label: "Yeni Haber", icon: Newspaper, color: "text-amber-600", bg: "bg-amber-50" },
                  { href: "/admin/categories/create", label: "Yeni Kategori", icon: Folder, color: "text-blue-600", bg: "bg-blue-50" },
                  { href: "/admin/authors/create", label: "Yeni Yazar", icon: UserRound, color: "text-indigo-600", bg: "bg-indigo-50" },
                  { href: "/admin/newsletter", label: "Bülten", icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 hover:border-slate-300 hover:bg-slate-100 transition-all group"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 transition-colors">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* KATEGORİ & YAZAR ÖZET */}
        {!loading && (categories.length > 0 || authors.length > 0) && (
          <div className="grid gap-5 sm:grid-cols-2">

            {/* KATEGORİLER */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-black text-slate-900">Kategoriler</h2>
                </div>
                <Link href="/admin/categories" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  Yönet →
                </Link>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {categories.slice(0, 8).map((cat) => {
                  const count = news.filter(n => n.category_id === cat.id).length;
                  return (
                    <Link
                      key={cat.id}
                      href={`/admin/news?kategori=${cat.slug}`}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-all"
                    >
                      <span>{cat.name}</span>
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 tabular-nums">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* YAZARLAR */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-rose-600" />
                  <h2 className="text-sm font-black text-slate-900">Yazar Kadrosu</h2>
                </div>
                <Link href="/admin/authors" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  Yönet →
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {authors.slice(0, 4).map((author) => {
                  const count = news.filter(n => n.author_id === author.id).length;
                  return (
                    <div key={author.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {author.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={author.avatar} alt={author.name} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-[11px] font-bold text-white">
                            {author.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">{author.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{author.email}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 tabular-nums">{count} haber</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </YonetimKabugu>
  );
}
