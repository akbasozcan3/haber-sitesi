"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import type { Category } from "@/types/uygulama";
import { DEFAULT_CATEGORIES } from "@/types/uygulama";
import SiteLogo from "@/components/common/SiteLogo";

export default function Header({
  categories = [],
  onOpenSearch,
}: {
  categories?: Category[];
  onOpenSearch?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Klavye Kısayolu: Cmd+K veya Ctrl+K ile arama çubuğuna odaklan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/arama?q=${encodeURIComponent(trimmed)}`);
      searchInputRef.current?.blur();
      setMobileOpen(false);
    } else if (onOpenSearch) {
      onOpenSearch();
    }
  };

  const activeCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const navbarFiltered = activeCategories.filter((c) => c.show_in_navbar !== false);
  const navCategories = navbarFiltered.length > 0 ? navbarFiltered.slice(0, 8) : activeCategories.slice(0, 8);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Kırmızı üst çizgi */}
      <div className="h-[2px] bg-red-600" />

      <div className="mx-auto flex min-h-[3.75rem] max-w-7xl 2xl:max-w-[1400px] items-center justify-between py-1 px-4 sm:px-6 lg:px-8">

        {/* Sol: Logo + Kategoriler */}
        <div className="flex min-w-0 flex-1 items-center gap-3 xl:gap-5 mr-2 sm:mr-3">
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
              aria-label="Menü"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="shrink-0 flex items-center">
              <SiteLogo />
            </Link>
          </div>

          <div className="hidden h-5 w-px shrink-0 bg-neutral-200 lg:block" />

          {/* Masaüstü Navigasyon (Kategori linkleri) */}
          <nav className="hidden lg:flex min-w-0 flex-1 items-center gap-0.5 xl:gap-1 flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navCategories.map((category, index) => {
              const isActive = pathname === `/kategori/${category.slug}`;
              const responsiveVisibility =
                index >= 7
                  ? "hidden 2xl:inline-flex"
                  : index >= 6
                  ? "hidden xl:inline-flex"
                  : "inline-flex";

              return (
                <Link
                  key={category.id}
                  href={`/kategori/${category.slug}`}
                  className={`${responsiveVisibility} shrink-0 items-center whitespace-nowrap px-2 xl:px-2.5 py-1 text-[12px] xl:text-[12.5px] font-bold tracking-tight rounded-md transition-all ${
                    isActive
                      ? "bg-neutral-950 text-white font-extrabold shadow-xs"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sağ: Tüm Haberler Butonu + Profesyonel Arama Girişi */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* Tüm Haberler Linki (Rozetsiz, sade ve profesyonel navigasyon sekmesi) */}
          <Link
            href="/haberler"
            className={`hidden lg:inline-flex shrink-0 items-center whitespace-nowrap px-2.5 py-1 text-[12px] xl:text-[12.5px] font-bold tracking-tight rounded-md transition-all ${
              pathname === "/haberler"
                ? "bg-neutral-950 text-white font-extrabold shadow-xs"
                : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100"
            }`}
          >
            Tüm Haberler
          </Link>

          <div className="hidden lg:block h-4 w-px bg-neutral-200 shrink-0 mx-0.5" />

          {/* Masaüstü & Tablet Arama Inputu */}
          <form
            onSubmit={handleSearchSubmit}
            className="group relative hidden sm:flex items-center rounded-full border border-neutral-200/90 bg-neutral-50/80 hover:bg-white hover:border-neutral-300 focus-within:bg-white focus-within:border-neutral-950 focus-within:ring-2 focus-within:ring-neutral-950/10 transition-all duration-200 shadow-2xs"
          >
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center pl-1 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
              aria-label="Arama Yap"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara..."
              className="w-24 sm:w-28 lg:w-32 xl:w-36 focus:w-36 sm:focus:w-44 lg:focus:w-48 xl:focus:w-52 transition-all duration-300 bg-transparent py-1.5 pr-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-neutral-400 hover:text-neutral-700 mr-1.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <span className="hidden xl:inline-flex items-center rounded border border-neutral-200/80 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 select-none mr-2">
                ⌘K
              </span>
            )}
          </form>

          {/* Mobilde ikon butonu (dar ekranda tıklandığında SearchModal açar) */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex sm:hidden h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Ara"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>

      {/* Mobil Menü */}
      {mobileOpen && (
        <div className="border-t border-neutral-100 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden animate-in slide-in-from-top-1 duration-200">
          {/* Mobil Arama Girişi */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-950 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-950/10 transition-all">
              <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Haber, konu veya kategori ara..."
                className="w-full bg-transparent text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="ml-2 rounded-lg bg-neutral-950 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-neutral-800"
              >
                Ara
              </button>
            </div>
          </form>

          <p className="mb-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-neutral-400">
            Kategoriler
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {navCategories.map((cat) => {
              const isActive = pathname === `/kategori/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-xs font-bold transition-all text-center whitespace-nowrap truncate ${
                    isActive
                      ? "bg-neutral-950 text-white font-extrabold shadow-xs"
                      : "bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100">
            <Link
              href="/haberler"
              onClick={() => setMobileOpen(false)}
              className={`block w-full text-center rounded-lg px-4 py-2.5 text-xs font-extrabold transition-all ${
                pathname === "/haberler"
                  ? "bg-neutral-950 text-white font-extrabold shadow-xs"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              Tüm Haberleri Keşfet
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}