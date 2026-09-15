"use client";

import { useState, useEffect, useRef } from "react";
import AdBanner from "./AdBanner";

export default function SideSkyscrapers() {
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const tickingRef = useRef(false);

  useEffect(() => {
    const checkDimensions = () => {
      if (typeof window !== "undefined") {
        // En az 1560px genişlik ve 750px yükseklik olmalıdır
        setIsWideScreen(window.innerWidth >= 1560 && window.innerHeight >= 750);
      }
    };

    checkDimensions();
    window.addEventListener("resize", checkDimensions, { passive: true });
    return () => window.removeEventListener("resize", checkDimensions);
  }, []);

  useEffect(() => {
    if (!isWideScreen) return;

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const footer = document.getElementById("site-footer") || document.querySelector("footer");
          if (footer) {
            const footerRect = footer.getBoundingClientRect();
            // Reklamın başlangıç top mesafesi: 112px (top-28), kule yüksekliği: ~630px, alt güvenlik boşluğu: 32px
            const adBottomDistance = 112 + 630 + 32;

            if (footerRect.top < adBottomDistance) {
              const overflow = adBottomDistance - footerRect.top;
              setTranslateY(-overflow);
              // Eğer footer ekranın yukarısına çıktıysa reklam tamamen görünmez olur
              setIsVisible(overflow < 650);
            } else {
              setTranslateY(0);
              setIsVisible(true);
            }
          }
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isWideScreen]);

  if (!isWideScreen || !isVisible) return null;

  return (
    <div
      style={{
        transform: translateY !== 0 ? `translateY(${translateY}px)` : undefined,
        transition: "transform 0.05s ease-out, opacity 0.2s ease-out",
      }}
      className="pointer-events-auto"
    >
      {/* Sol kule reklamı */}
      <aside
        aria-label="Sol Reklam"
        className="fixed left-4 top-28 z-30 w-[160px]"
      >
        <AdBanner format="skyscraper" position="left-wing" />
      </aside>

      {/* Sağ kule reklamı */}
      <aside
        aria-label="Sağ Reklam"
        className="fixed right-4 top-28 z-30 w-[160px]"
      >
        <AdBanner format="skyscraper" position="right-wing" />
      </aside>
    </div>
  );
}
