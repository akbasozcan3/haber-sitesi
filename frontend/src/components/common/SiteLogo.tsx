"use client";

import { useState, useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface SiteLogoProps {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  height?: number;
}

export function formatLogoUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return trimmed;
}

export default function SiteLogo({
  className = "",
  imgClassName = "w-auto max-w-[360px] sm:max-w-[440px] object-contain transition-all duration-150",
  textClassName = "text-xl sm:text-2xl font-black tracking-tight",
  height,
}: SiteLogoProps) {
  const { settings, loading } = useSiteSettings();
  const [imgError, setImgError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const rawLogo = settings.site_logo;
  const configuredHeight = Number(settings.site_logo_height) || 52;
  const targetHeight = height !== undefined ? height : configuredHeight;

  const formattedUrl = formatLogoUrl(rawLogo);
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");
  const activeSrc = triedFallback
    ? (formattedUrl.startsWith("/") ? `${apiBase}${formattedUrl}` : formattedUrl)
    : formattedUrl;
  useEffect(() => {
    setImgError(false);
    setTriedFallback(false);
  }, [rawLogo]);

  // LOGO RESMİ VARSA SADECE RESİM GÖSTERİLİR (KESİNLİKLE YAZI YOK)
  if (rawLogo && activeSrc && !imgError) {
    return (
      <span suppressHydrationWarning className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          suppressHydrationWarning
          src={activeSrc}
          alt={settings.site_title || "Site Logosu"}
          onError={() => {
            if (!triedFallback && activeSrc.startsWith("/")) {
              setTriedFallback(true);
            } else {
              setImgError(true);
            }
          }}
          className={imgClassName}
          style={{
            height: `${targetHeight}px`,
            maxHeight: `${targetHeight}px`,
            width: "auto",
            objectFit: "contain",
            imageRendering: "auto",
          }}
        />
      </span>
    );
  }

  // Eğer ilk yüklemedeyse ve logo resmi henüz gelmemişse eski logo yazısını gösterme
  if (loading && !rawLogo) {
    return (
      <span
        suppressHydrationWarning
        className={`inline-block opacity-0 ${className}`}
        style={{ height: `${targetHeight}px`, width: "120px" }}
      />
    );
  }

  // Sadece logo resmi gerçekten boş veya kaldırılmışsa varsayılan zernews logosu gösterilir
  return (
    <span suppressHydrationWarning className={`inline-flex items-center ${textClassName} ${className}`}>
      <span className={textClassName.includes("text-white") ? "text-white" : "text-neutral-950"}>zer</span>
      <span className="text-red-600">news</span>
    </span>
  );
}
