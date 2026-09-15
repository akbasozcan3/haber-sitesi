"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Flame, 
  Search, 
  Rss
} from "lucide-react";
import type { News } from "@/types/uygulama";

function TwitterIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function YoutubeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function TopBar({ 
  latestNews = [], 
  onOpenSearch 
}: { 
  latestNews?: News[]; 
  onOpenSearch?: () => void; 
}) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [currentDate] = useState(() => new Intl.DateTimeFormat("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()));

  useEffect(() => {
    if (latestNews.length <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % latestNews.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [latestNews.length]);

  const activeNews = latestNews[tickerIndex] || null;

  return (
    <div className="border-b border-slate-800 bg-[#0b0f19] text-xs text-slate-300">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Sol: Tarih & Son Dakika Ticker */}
        <div className="flex items-center gap-4 overflow-hidden">
          <span className="hidden font-medium text-slate-400 sm:inline-block">
            {currentDate}
          </span>
          <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />

          {activeNews && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-xs">
                <Flame className="h-3 w-3" /> GÜNDEM
              </span>
              <Link
                href={`/haberler/${activeNews.slug}`}
                className="truncate font-medium text-slate-200 transition-colors hover:text-red-400"
              >
                {activeNews.title}
              </Link>
            </div>
          )}
        </div>

        {/* Orta: Finans Göstergeleri (BIST, Dolar, Euro, BTC) */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">BIST 100 <strong className="text-emerald-400 font-semibold">10.450</strong> <span className="text-[9px] text-emerald-400">▲%1.2</span></span>
          <span className="h-2.5 w-px bg-slate-800" />
          <span className="flex items-center gap-1">USD/TRY <strong className="text-slate-200 font-semibold">38,45</strong></span>
          <span className="h-2.5 w-px bg-slate-800" />
          <span className="flex items-center gap-1">EUR/TRY <strong className="text-slate-200 font-semibold">41,80</strong></span>
          <span className="h-2.5 w-px bg-slate-800" />
          <span className="flex items-center gap-1">BTC <strong className="text-emerald-400 font-semibold">$94.200</strong> <span className="text-[9px] text-emerald-400">▲%2.4</span></span>
        </div>

        {/* Sağ: Sosyal Medya & Hızlı Bağlantılar */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              title="X / Twitter"
              aria-label="X / Twitter"
            >
              <TwitterIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              title="YouTube"
              aria-label="YouTube"
            >
              <YoutubeIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/haberler"
              className="text-slate-400 transition-colors hover:text-red-400"
              title="RSS Akışı"
              aria-label="RSS Akışı"
            >
              <Rss className="h-3.5 w-3.5" />
            </Link>
          </div>

          <span className="hidden h-3 w-px bg-slate-700 md:inline-block" />

          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              title="Arama Yap"
            >
              <Search className="h-3 w-3" />
              <span className="hidden sm:inline">Ara...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
