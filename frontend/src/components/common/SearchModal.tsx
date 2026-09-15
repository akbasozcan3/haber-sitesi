"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import type { Category, News } from "@/types/uygulama";
import { searchNews } from "@/lib/api/haberler";

export default function SearchModal({
  isOpen,
  onClose,
  categories = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchNews(query, 6);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/40 p-4 pt-16 backdrop-blur-sm sm:p-6 sm:pt-24 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ARAMA FORMU */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-neutral-100 px-4">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              if (!nextQuery.trim()) {
                setResults([]);
                setLoading(false);
              }
            }}
            placeholder="Haber, konu veya kategori arayın..."
            className="w-full bg-transparent px-3 py-4 text-base font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-red-600 mr-2 shrink-0" />}
          {query && !loading && (
            <button type="button" onClick={() => setQuery("")} className="p-1 text-neutral-400 hover:text-neutral-900 mr-1">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            ESC
          </button>
        </form>

        {/* SONUÇLAR & KATEGORİLER */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {query.trim() === "" ? (
            /* Boş arama → kategorileri göster */
            categories.length > 0 ? (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-neutral-400 uppercase mb-3">
                  <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                  <span>KATEGORİLER</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      onClick={onClose}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-500">
                {results.length} sonuç bulundu
              </p>
              <div className="divide-y divide-neutral-100">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/haberler/${item.slug}`}
                    onClick={onClose}
                    className="group flex items-center justify-between py-3 transition-colors hover:bg-neutral-50 rounded-xl px-2.5"
                  >
                    <div className="pr-4 min-w-0">
                      {item.category && (
                        <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
                          {item.category.name}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-red-600 line-clamp-1 transition-colors">
                        {item.title}
                      </h4>
                      {item.excerpt && (
                        <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-red-600" />
                  </Link>
                ))}
              </div>
              <div className="pt-3 border-t border-neutral-100 text-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-red-600 transition-colors"
                >
                  <span>&quot;{query}&quot; için tüm sonuçları gör</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : !loading ? (
            <div className="py-8 text-center text-neutral-400">
              <p className="text-sm font-medium">Eşleşen haber bulunamadı.</p>
              <p className="mt-1 text-xs text-neutral-500">
                Farklı anahtar kelimeler deneyin.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
