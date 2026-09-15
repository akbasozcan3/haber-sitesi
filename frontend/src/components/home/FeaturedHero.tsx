"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
  type MouseEvent,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { News } from "@/types/uygulama";
import NewsCard from "@/components/news/NewsCard";
import FeaturedSidebar from "./FeaturedSidebar";
import EditorialSecondarySlider from "./EditorialSecondarySlider";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;

interface FeaturedHeroProps {
  news?: News[];
  heroNews?: News[];
  sidebarNews?: News[];
  secondaryNews?: News[];
}

export default function FeaturedHero({
  news = [],
  heroNews,
  sidebarNews,
  secondaryNews,
}: FeaturedHeroProps) {
  // Manşet, Öne Çıkanlar ve Günün Gelişmeleri tamamen FARKLI haber kümeleridir!
  const heroStories = heroNews ?? news.slice(0, 4);
  const sidebarStories =
    sidebarNews ??
    (news.length > 4 ? news.slice(4, 8) : news.slice(0, 4));
  const secondaryStories =
    secondaryNews ??
    (news.length > 8 ? news.slice(8) : news.slice(4));

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const totalSlides = heroStories.length;

  const next = useCallback(() => {
    setDragOffset(0);
    setActiveIndex((current) =>
      totalSlides <= 1 ? current : (current + 1) % totalSlides
    );
  }, [totalSlides]);

  const prev = useCallback(() => {
    setDragOffset(0);
    setActiveIndex((current) =>
      totalSlides <= 1 ? current : (current - 1 + totalSlides) % totalSlides
    );
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1 || isHovered || isDragging) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [totalSlides, isHovered, isDragging]);

  useEffect(() => {
    if (activeIndex >= totalSlides && totalSlides > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, totalSlides]);

  /* -------------------------------- */
  /* TOUCH EVENTS                     */
  /* -------------------------------- */

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const x = e.touches[0]?.clientX ?? null;
    touchStartX.current = x;
    touchDeltaX.current = 0;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0]?.clientX ?? touchStartX.current;
    const delta = currentX - touchStartX.current;
    touchDeltaX.current = delta;
    setDragOffset(delta * 0.85);
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaX.current;
    setIsDragging(false);
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    } else {
      setDragOffset(0);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  /* -------------------------------- */
  /* MOUSE DRAG                       */
  /* -------------------------------- */

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    mouseStartX.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    touchDeltaX.current = delta;
    setDragOffset(delta * 0.85);
  };

  const handleMouseUp = () => {
    if (mouseStartX.current === null) return;
    const delta = touchDeltaX.current;
    setIsDragging(false);
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    } else {
      setDragOffset(0);
    }
    mouseStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleMouseLeaveSlider = () => {
    if (mouseStartX.current === null) return;
    setIsDragging(false);
    setDragOffset(0);
    mouseStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (heroStories.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* BÖLÜM BAŞLIĞI */}
      <div className="relative mb-7 flex items-center justify-between border-b border-neutral-200 pb-3.5">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-950 sm:text-2xl">
            Günün Manşetleri
          </h2>
        </div>
        <div className="absolute -bottom-px left-0 h-0.5 w-32 bg-red-600 rounded-full" />
      </div>

      {/* Ana içerik: 12 Sütunlu Dengeli Izgara (8 Sütun Sol Manşet, 4 Sütun Sağ Sidebar) */}
      <div className="grid gap-8 lg:grid-cols-12 xl:gap-10">
        {/* SOL: SLIDER (8 Sütun) */}
        <div
          className={`relative select-none lg:col-span-8 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseLeaveSlider();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "pan-y",
          }}
        >
          {/* Slider viewport */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className={`flex ${
                isDragging
                  ? ""
                  : "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              }`}
              style={{
                transform: `translate3d(calc(-${
                  activeIndex * 100
                }% + ${dragOffset}px), 0, 0)`,
              }}
            >
              {heroStories.map((story, index) => {
                const isActive = index === activeIndex;

                return (
                  <div key={story.id} className="w-full shrink-0">
                    <NewsCard news={story} variant="featured-main" priority={isActive} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sol ok — Görsel dikey merkezinde, marka sarısı hover, gölgesiz düz şık tasarım */}
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Önceki haber"
              className="absolute left-3.5 top-[30%] sm:top-[34%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-900 backdrop-blur-xs transition-all duration-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 sm:left-4 sm:h-11 sm:w-11 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Sağ ok — Görsel dikey merkezinde, gölgesiz düz şık tasarım */}
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Sonraki haber"
              className="absolute right-3.5 top-[30%] sm:top-[34%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-900 backdrop-blur-xs transition-all duration-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 sm:right-4 sm:h-11 sm:w-11 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* SAĞ: ÖNE ÇIKANLAR (4 Sütun - Manşet kaydıkça zıplamaz, tamamen ayrı 4 haber) */}
        <div className="lg:col-span-4">
          <FeaturedSidebar news={sidebarStories} />
        </div>
      </div>

      {/* İKİNCİ SLIDER: GÜNÜN ÖNEMLİ GELİŞMELERİ (Ölçeklenen, Kapanıp Blurlu Açılan Sinematik Slider) */}
      {secondaryStories.length > 0 && (
        <EditorialSecondarySlider stories={secondaryStories} />
      )}
    </section>
  );
}
