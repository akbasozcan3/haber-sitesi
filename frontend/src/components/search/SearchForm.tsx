"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Tag } from "lucide-react";

interface SearchFormProps {
  initialQuery?: string;
  popularTags?: string[];
}

const DEFAULT_POPULAR_TAGS = [
  "E-Ticaret",
  "Fintek",
  "Yapay Zeka",
  "Yatırım",
  "SaaS",
];

export default function SearchForm({
  initialQuery = "",
  popularTags = DEFAULT_POPULAR_TAGS,
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/arama?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/arama");
    }
  };

  const handleTagClick = (tag: string) => {
    if (query.trim().toLowerCase() === tag.toLowerCase()) {
      setQuery("");
      router.push("/arama");
    } else {
      setQuery(tag);
      router.push(`/arama?q=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-red-600 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Haber, teknoloji konusu veya şirket ara..."
            className="w-full rounded-2xl border border-gray-200/90 bg-neutral-50/70 py-3.5 pl-11 pr-10 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Aramayı temizle"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-2xl bg-neutral-950 hover:bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
        >
          Ara
        </button>
      </form>

      {/* Popüler Etiket Önerileri */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
          <Tag className="h-3 w-3 text-red-600" />
          Popüler Etiketler:
        </span>
        {popularTags.map((tag) => {
          const isSelected = query.trim().toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              title={isSelected ? `${tag} etiketini temizle` : `${tag} etiketine göre filtrele`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-red-600 text-white shadow-sm border border-red-600 ring-2 ring-red-600/20 font-bold"
                  : "bg-white text-neutral-700 border border-gray-200/90 hover:border-red-400 hover:bg-red-50 hover:text-red-600 shadow-2xs"
              }`}
            >
              <span className={isSelected ? "text-white font-black" : "text-red-600 font-extrabold"}>#</span>
              <span>{tag}</span>
              {isSelected && (
                <span className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[10px] text-white hover:bg-white/30">
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
