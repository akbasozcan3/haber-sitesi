"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import type { Category, SiteSettings } from "@/types/uygulama";
import { getCategories } from "@/lib/api/haberler";
import Header from "./Header";
import Footer from "./Footer";
import SearchModal from "../common/SearchModal";
import SideSkyscrapers from "../ads/SideSkyscrapers";
import AdBanner from "../ads/AdBanner";

import { SiteSettingsProvider } from "@/context/SiteSettingsContext";

interface AdContextType {
  showAds: boolean;
  setShowAds: (show: boolean) => void;
}

export const AdContext = createContext<AdContextType>({
  showAds: true,
  setShowAds: () => {},
});

export function useAdContext() {
  return useContext(AdContext);
}

export default function SiteLayout({
  children,
  initialSettings,
  initialCategories = [],
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
  initialCategories?: Category[];
}) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showAds, setShowAds] = useState(true);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setShowAds(true);
  }, [pathname]);

  useEffect(() => {
    if (!isAdmin && categories.length === 0) {
      getCategories()
        .then(setCategories)
        .catch((error) => {
          console.error("Layout data loading error:", error);
        });
    }
  }, [isAdmin, categories.length]);

  return (
    <SiteSettingsProvider initialSettings={initialSettings}>
      {isAdmin ? (
        <>{children}</>
      ) : (
        <AdContext.Provider value={{ showAds, setShowAds }}>
          <div className="relative flex min-h-screen flex-col bg-white text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
            {showAds && <SideSkyscrapers />}

            <Header
              categories={categories}
              onOpenSearch={() => setIsSearchOpen(true)}
            />

            {showAds && (
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-2">
                <AdBanner format="leaderboard" position="top-header" />
              </div>
            )}

            <main className="flex-1">{children}</main>

            <Footer categories={categories} />

            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              categories={categories}
            />
          </div>
        </AdContext.Provider>
      )}
    </SiteSettingsProvider>
  );
}
