"use client";

import { useEffect, useRef } from "react";

interface GoogleAdSenseProps {
  client?: string;
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export default function GoogleAdSense({
  client = "ca-pub-4161709832087107",
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    if (!slot) return;
    try {
      if (typeof window !== "undefined") {
        const el = adRef.current;
        if (el && (el.offsetWidth > 0 || (el.parentElement && el.parentElement.offsetWidth > 0))) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        }
      }
    } catch {
      // Sessizce yut
    }
  }, [slot]);

  return (
    <div className={`mx-auto w-full my-8 text-center overflow-hidden ${className}`}>
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="h-px w-6 bg-neutral-200" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
          Sponsorlu İçerik / Reklam
        </span>
        <span className="h-px w-6 bg-neutral-200" />
      </div>
      <div className="relative min-h-[100px] w-full rounded-none border border-neutral-200/70 bg-neutral-50/40 p-2 flex items-center justify-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={client}
          {...(slot ? { "data-ad-slot": slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
