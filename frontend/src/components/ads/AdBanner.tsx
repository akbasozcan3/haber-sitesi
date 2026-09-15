"use client";

import { useEffect, useRef } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export type AdFormat = "leaderboard" | "billboard" | "skyscraper" | "rectangle" | "in-feed";

interface AdBannerProps {
  client?: string;
  slot?: string;
  format?: AdFormat;
  position?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

// Google AdChoices rozeti (Diğer büyük sitelerdeki gibi)
function GoogleAdChoicesBadge() {
  return (
    <a
      href="https://adssettings.google.com/whythisad"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute right-0 top-0 z-20 flex items-center gap-1 bg-white/95 px-1.5 py-0.5 rounded-none shadow-2xs border-b border-l border-neutral-200/80 text-[9px] font-sans text-neutral-500 hover:text-neutral-800 transition select-none cursor-pointer"
      title="Google Reklam Seçenekleri"
      onClick={(e) => e.stopPropagation()}
    >
      <svg width="11" height="11" viewBox="0 0 15 15" fill="none">
        <path
          d="M7.5 1.5a6 6 0 100 12 6 6 0 100-12m0 1a5 5 0 110 10 5 5 0 110-10zM6.625 11h1.75V6.5h-1.75zM7.5 3.75a1 1 0 100 2 1 1 0 100-2z"
          fill="#00aecd"
        />
      </svg>
      <span>AdChoices</span>
    </a>
  );
}

export default function AdBanner({
  client,
  slot,
  format = "leaderboard",
  position = "default",
  className = "",
}: AdBannerProps) {
  const { settings } = useSiteSettings();
  const adRef = useRef<HTMLModElement | null>(null);

  const isAdsGloballyEnabled = settings.ads_enabled !== "0" && settings.ads_enabled !== false;
  const activeClient = client || settings.adsense_client || "ca-pub-4161709832087107";

  const activeSlot =
    slot ||
    (position === "top-header"
      ? settings.adsense_slot_header
      : position === "home-middle"
      ? settings.adsense_slot_billboard
      : position.includes("sidebar")
      ? settings.adsense_slot_sidebar
      : settings.adsense_slot_article) ||
    "";

  useEffect(() => {
    if (!isAdsGloballyEnabled) return;
    if (!activeSlot) return;

    const el = adRef.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;

    // Sadece kapsayıcı genişliği 0'dan büyükse AdSense push çağrılır (availableWidth=0 hatasını önler)
    const tryPush = () => {
      try {
        if (typeof window !== "undefined" && el && !el.getAttribute("data-adsbygoogle-status")) {
          const width = el.offsetWidth || el.parentElement?.offsetWidth || 0;
          if (width > 0) {
            el.setAttribute("data-adsbygoogle-status", "pending");
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        }
      } catch {
        // Sessizce yut
      }
    };

    const timerId = setTimeout(tryPush, 100);

    return () => {
      clearTimeout(timerId);
    };
  }, [isAdsGloballyEnabled, activeSlot]);

  if (!isAdsGloballyEnabled) {
    return null;
  }

  // Ortak Google AdSense <ins> bileşeni
  const adsenseElement = (
    <ins
      ref={adRef}
      className="adsbygoogle block w-full h-full"
      style={{ display: "block" }}
      data-ad-client={activeClient}
      {...(activeSlot ? { "data-ad-slot": activeSlot } : {})}
      data-ad-format={format === "skyscraper" ? "vertical" : format === "rectangle" ? "rectangle" : "auto"}
      data-full-width-responsive="true"
    />
  );

  // 1. Skyscraper (Kule Reklamı: 160x600 - Containerın Solunda & Sağında)
  if (format === "skyscraper") {
    return (
      <div className={`flex flex-col items-center w-[160px] ${className}`}>
        <span className="mb-1 block text-[9px] font-medium uppercase tracking-widest text-neutral-400 select-none">
          Reklam
        </span>
        <div className="relative w-[160px] h-[600px] overflow-hidden rounded-none border border-neutral-200/80 bg-neutral-50/50 shadow-2xs flex items-center justify-center">
          <GoogleAdChoicesBadge />
          {adsenseElement}
        </div>
      </div>
    );
  }

  // 2. Rectangle (Kenar Çubuğu / Sidebar: 300x250)
  if (format === "rectangle") {
    return (
      <div className={`w-full my-4 text-center ${className}`}>
        <span className="mb-1 block text-[9px] font-medium uppercase tracking-widest text-neutral-400 select-none">
          Reklam
        </span>
        <div className="relative w-[300px] h-[250px] mx-auto overflow-hidden rounded-none border border-neutral-200/80 bg-neutral-50/50 shadow-2xs flex items-center justify-center">
          <GoogleAdChoicesBadge />
          {adsenseElement}
        </div>
      </div>
    );
  }

  // 3. Billboard (Ana Sayfa Orta Vitrin: 970x250)
  if (format === "billboard") {
    return (
      <div className={`mx-auto w-full my-8 max-w-[970px] px-2 text-center ${className}`}>
        <span className="mb-1 block text-[9px] font-medium uppercase tracking-widest text-neutral-400 select-none">
          Reklam
        </span>
        <div className="relative w-full max-w-[970px] min-h-[140px] sm:h-[250px] mx-auto overflow-hidden rounded-none border border-neutral-200/80 bg-neutral-50/50 shadow-2xs flex items-center justify-center">
          <GoogleAdChoicesBadge />
          {adsenseElement}
        </div>
      </div>
    );
  }

  // 4. Leaderboard (Header Üstü & Makale İçi: 728x90)
  return (
    <div className={`mx-auto w-full my-4 max-w-[728px] px-2 text-center ${className}`}>
      <span className="mb-1 block text-[9px] font-medium uppercase tracking-widest text-neutral-400 select-none">
        Reklam
      </span>
      <div className="relative w-full max-w-[728px] h-[90px] mx-auto overflow-hidden rounded-none border border-neutral-200/80 bg-neutral-50/50 shadow-2xs flex items-center justify-center">
        <GoogleAdChoicesBadge />
        {adsenseElement}
      </div>
    </div>
  );
}
