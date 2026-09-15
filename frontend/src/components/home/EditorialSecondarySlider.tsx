"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { News } from "@/types/uygulama";
import CategoryBadge from "@/components/common/CategoryBadge";

const AUTOPLAY_MS = 5500;
const DRAG_THRESHOLD = 45;

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Bugün";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) {
    if (diffDays === 1) return "Dün";
    if (diffDays < 30) return `${diffDays} gün önce`;
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(date);
  }
  if (diffHours > 0) return `${diffHours} saat önce`;
  return "Az önce";
}

interface EditorialSecondarySliderProps {
  stories: News[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  className?: string;
}

export default function EditorialSecondarySlider({
  stories = [],
  title,
  viewAllHref,
  className = "",
}: EditorialSecondarySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const total = stories.length;

  // Ekran boyutuna göre görünür kart sayısını güncelle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, total - cardsPerView);

  // Taşma durumunda indexi sınırla
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const next = useCallback(() => {
    setDragOffset(0);
    setCurrentIndex((curr) => (curr >= maxIndex ? 0 : curr + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setDragOffset(0);
    setCurrentIndex((curr) => (curr <= 0 ? maxIndex : curr - 1));
  }, [maxIndex]);

  // Otomatik geçiş (mouse üzerine gelince veya sürüklerken duraklar)
  useEffect(() => {
    if (total <= cardsPerView || isHovered || isDragging) return;

    const interval = setInterval(() => {
      next();
    }, AUTOPLAY_MS);

    return () => clearInterval(interval);
  }, [total, cardsPerView, isHovered, isDragging, next]);

  /* -------------------------------- */
  /* TOUCH / SWIPE İŞLEMLERİ          */
  /* -------------------------------- */

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
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
    if (Math.abs(delta) >= DRAG_THRESHOLD) {
      if (delta < 0) next();
      else prev();
    } else {
      setDragOffset(0);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  /* -------------------------------- */
  /* MOUSE DRAG İŞLEMLERİ             */
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
    if (Math.abs(delta) >= DRAG_THRESHOLD) {
      if (delta < 0) next();
      else prev();
    } else {
      setDragOffset(0);
    }
    mouseStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleMouseLeave = () => {
    if (mouseStartX.current === null) return;
    setIsDragging(false);
    setDragOffset(0);
    mouseStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (total === 0) return null;

  return (
    <section className={`relative mt-14 border-t border-neutral-200/80 pt-10 ${className}`}>
      {/* Üst Başlık & Kontrol Çubuğu: Profesyonel Kırmızı Vurgulu Çizgi */}
      <div className="relative mb-8 flex items-center justify-between border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
            {title || "Günün Önemli Gelişmeleri"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-bold text-neutral-800 transition-all duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
              <span>Tüm Haber Akışını Gör</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          {/* Ok Navigasyon Butonları — Düz, gölgesiz, modern */}
          {total > cardsPerView && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Önceki haberler"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-all duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-90 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Sonraki haberler"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-all duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-90 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="absolute -bottom-px left-0 h-0.5 w-40 bg-red-600 rounded-full" />
      </div>

      {/* Slider Görünüm Alanı (Overflow Hidden - Taşan kartlar küçülüp blurlu kaybolur) */}
      <div
        className={`relative select-none overflow-hidden -mx-2 px-2 -mt-1.5 pt-1.5 pb-4 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseLeave();
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        {/* Ray (Track) - translate3d ile akıcı kayma */}
        <div
          className={`flex gap-5 ${
            isDragging
              ? ""
              : "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          }`}
          style={{
            transform: `translate3d(calc(-${currentIndex} * ((100% + 1.25rem) / ${cardsPerView}) + ${dragOffset}px), 0, 0)`,
          }}
        >
          {stories.map((story, idx) => {
            const rel = idx - currentIndex;
            const isLeft = rel < 0;
            const isRight = rel >= cardsPerView;

            let motionStyles = "opacity-100";
            if (isLeft) {
              motionStyles = "opacity-0 -translate-x-3 pointer-events-none";
            } else if (isRight) {
              motionStyles = "opacity-20 translate-x-3 pointer-events-none";
            }

            return (
              <div
                key={story.id}
                className={`shrink-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${motionStyles}`}
                style={{
                  width:
                    cardsPerView === 1
                      ? "100%"
                      : cardsPerView === 2
                      ? "calc((100% - 1.25rem) / 2)"
                      : "calc((100% - 2.5rem) / 3)",
                }}
              >
                <EditorialCard story={story} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Webrazzi & Onedio standartlarında editoryal kart */
export function EditorialCard({ story }: { story: News }) {
  const [imgError, setImgError] = useState(false);
  const timeAgo = formatRelativeTime(story.published_at || story.created_at);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Görsel */}
      <Link href={`/haberler/${story.slug}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100">
          {story.image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={story.image}
              alt={story.title}
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-xs font-bold text-neutral-400">
              {story.category?.name ?? "Zernews"}
            </div>
          )}
        </div>
      </Link>

      {/* İçerik */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          {story.category && (
            <div className="mb-2">
              <CategoryBadge category={story.category} />
            </div>
          )}

          <Link href={`/haberler/${story.slug}`}>
            <h4 className="line-clamp-2 text-sm font-extrabold leading-snug text-neutral-900 transition-colors group-hover:text-red-600 sm:text-[15px]">
              {story.title}
            </h4>
          </Link>

          {story.excerpt && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {story.excerpt}
            </p>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white">
              {(story.author?.name || "Z").charAt(0)}
            </div>
            <span className="truncate font-semibold text-neutral-700">
              {story.author?.name ?? "Zernews"}
            </span>
          </div>
          <span className="shrink-0 font-medium text-neutral-400">
            {timeAgo}
          </span>
        </div>
      </div>
    </article>
  );
}
