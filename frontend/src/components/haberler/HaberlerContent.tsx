"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Block = {
  kind: "paragraph" | "heading" | "quote" | "list" | "code" | "image";
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  ordered?: boolean;
  text?: string;
  items?: string[];
  url?: string;
  alt?: string;
};

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={index}>{part.slice(1, -1)}</em>;
    const markdownLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (markdownLink)
      return (
        <a
          key={index}
          href={markdownLink[2]}
          target="_blank"
          rel="noreferrer"
          className="text-[#9a7117] underline decoration-[#d4af37]/50 underline-offset-4"
        >
          {markdownLink[1]}
        </a>
      );
    if (/^https?:\/\//.test(part))
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-[#9a7117] underline underline-offset-4"
        >
          {part}
        </a>
      );
    return <span key={index}>{part}</span>;
  });
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (line === "```") {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== "```") {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ kind: "code", text: code.join("\n") });
      index += 1;
      continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      blocks.push({ kind: "image", alt: image[1], url: image[2] });
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: heading[2],
      });
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push({ kind: "quote", text: line.slice(2) });
      index += 1;
      continue;
    }
    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      const items: string[] = [];
      while (
        index < lines.length &&
        (/^[-*] /.test(lines[index].trim()) ||
          /^\d+\. /.test(lines[index].trim()))
      ) {
        items.push(lines[index].trim().replace(/^([-*]|\d+\.)\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "list", ordered: /^\d+\. /.test(line), items });
      continue;
    }
    const paragraphs = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6} |> |[-*] |\d+\. |```|!\[)/.test(lines[index].trim())
    ) {
      paragraphs.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraphs.join(" ") });
  }
  return blocks;
}

function renderBlock(block: Block, index: number): ReactNode {
  if (block.kind === "heading") {
    const content = parseInline(block.text || "");
    if (block.level === 1) return <h1 key={index}>{content}</h1>;
    if (block.level === 2) return <h2 key={index}>{content}</h2>;
    if (block.level === 3) return <h3 key={index}>{content}</h3>;
    if (block.level === 4) return <h4 key={index}>{content}</h4>;
    if (block.level === 5) return <h5 key={index}>{content}</h5>;
    return <h6 key={index}>{content}</h6>;
  }
  if (block.kind === "quote")
    return <blockquote key={index}>{parseInline(block.text || "")}</blockquote>;
  if (block.kind === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List key={index}>
        {block.items?.map((item) => (
          <li key={item}>{parseInline(item)}</li>
        ))}
      </List>
    );
  }
  if (block.kind === "code")
    return (
      <pre key={index}>
        <code>{block.text}</code>
      </pre>
    );
  if (block.kind === "image")
    return (
      <Image
        key={index}
        src={block.url || ""}
        alt={block.alt || "Haber görseli"}
        width={1200}
        height={675}
        unoptimized
        className="h-auto w-full"
      />
    );
  return <p key={index}>{parseInline(block.text || "")}</p>;
}

/**
 * Haber içeriğini sayfalara böler.
 * Kullanıcı isteği ve SEO standardı gereğince:
 * - Kısa haberler tek sayfa kalır (bölünmez).
 * - Orta/uzun haberler en fazla 2 ila 3 sayfaya bölünür (asla 4 veya daha fazla sayfaya bölünmez).
 */
function splitIntoPages(blocks: Block[]): Block[][] {
  if (!blocks || blocks.length === 0) return [[]];

  // Bloklardaki toplam metin karakter sayısını hesapla
  const totalLength = blocks.reduce((sum, b) => {
    return sum + (b.text?.length || 0) + (b.items?.join(" ").length || 0);
  }, 0);

  // Kısa haberler: 700 karakterden az veya 2 veya daha az blok ise bölme, tek sayfa kalsın
  if (totalLength < 700 || blocks.length <= 2) {
    return [blocks];
  }

  // Sayfa Sınırı: Çok uzun haberlerde (> 1800 karakter ve en az 5 blok) 3 sayfa; aksi halde 2 sayfa.
  // Kesin kural: Asla 3 sayfadan fazlasına bölünmez.
  const targetPages = totalLength > 1800 && blocks.length >= 5 ? 3 : 2;

  const pages: Block[][] = [];
  const chunkSize = Math.ceil(blocks.length / targetPages);

  for (let i = 0; i < blocks.length; i += chunkSize) {
    pages.push(blocks.slice(i, i + chunkSize));
  }

  // Güvenlik: Eğer 3'ten fazla sayfa oluştuysa 3. sayfada birleştir
  if (pages.length > 3) {
    const p1 = pages[0];
    const p2 = pages[1];
    const p3 = pages.slice(2).flat();
    return [p1, p2, p3];
  }

  return pages.length > 0 ? pages : [blocks];
}

interface HaberlerContentProps {
  content: string;
  source?: string;
  slug?: string;
  initialPage?: number;
}

export default function HaberlerContent({
  content,
  source = "AA",
  initialPage = 1,
}: HaberlerContentProps) {
  const blocks = parseBlocks(content);
  const pages = splitIntoPages(blocks);
  const totalPages = pages.length;

  // Başlangıç sayfası: 1-indexed'den 0-indexed'e dönüştür ve sınırla
  const [currentPage, setCurrentPage] = useState(() => {
    const safeInit = Math.max(0, (initialPage || 1) - 1);
    return Math.min(safeInit, Math.max(0, totalPages - 1));
  });

  // initialPage prop'u değişirse state'i senkronize et
  useEffect(() => {
    if (typeof initialPage === "number") {
      const safe = Math.max(0, Math.min(initialPage - 1, totalPages - 1));
      setCurrentPage(safe);
    }
  }, [initialPage, totalPages]);

  // Tarayıcı Geri/İleri butonlarını (popstate) dinle
  useEffect(() => {
    function onPopState() {
      const searchParams = new URLSearchParams(window.location.search);
      const sayfaVal = searchParams.get("sayfa");
      const pageIndex = sayfaVal ? Math.max(0, parseInt(sayfaVal, 10) - 1) : 0;
      setCurrentPage(Math.min(pageIndex, totalPages - 1));
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [totalPages]);

  function handlePageChange(targetPageIndex: number) {
    const safeIndex = Math.max(0, Math.min(targetPageIndex, totalPages - 1));
    setCurrentPage(safeIndex);

    const pageNumber = safeIndex + 1;

    // URL Güncellemesi:
    // Sayfa 1 için sade /haberler/[slug], 2 ve 3 için ?sayfa=N
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (pageNumber === 1) {
        url.searchParams.delete("sayfa");
      } else {
        url.searchParams.set("sayfa", pageNumber.toString());
      }
      window.history.pushState({ sayfa: pageNumber }, "", url.toString());

      // Otomatik Kaydırma (Scroll to Top): Makalenin en tepesine kaydır
      const articleEl =
        document.getElementById("haber-metni") ||
        document.querySelector(".news-article-content");
      if (articleEl) {
        const yOffset = -90; // Navbar yüksekliği için pay
        const y =
          articleEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }
  }

  const currentBlocks = pages[currentPage] ?? [];
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="news-prose">
      {/* Aktif sayfa blokları */}
      <div className="min-h-[180px]">
        {currentBlocks.map((block, idx) => renderBlock(block, idx))}
      </div>

      {/* =====================================================
          KAYNAK VE ÇOK SAYFALI HABER ADIMLARI (STEPS / SAYFALAMA)
      ====================================================== */}
      {totalPages > 1 ? (
        <div className="mt-8 select-none border-t border-slate-200/80 pt-6">
          {/* Üst Bilgi Çubuğu: Kaynak ve Sayfa İlerleme Göstergesi */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="font-semibold">Kaynak:</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-bold text-slate-800 border border-slate-200/60">
                {source}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">
                Bölüm {currentPage + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentPage
                        ? "w-6 bg-red-600"
                        : i < currentPage
                        ? "w-2.5 bg-red-200"
                        : "w-2.5 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Haberin Devamını Oku (Sade ve Profesyonel Kart) */}
          {!isLastPage ? (
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              className="group relative mt-6 flex w-full cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md text-left"
            >
              {/* Arka plan zarif bölüm numarası filigranı */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-4 -bottom-5 select-none text-8xl sm:text-9xl font-black tracking-tighter text-slate-100/80 transition-all duration-300 group-hover:scale-105 group-hover:text-red-50/70"
              >
                0{currentPage + 2}
              </span>

              <div className="relative z-10 min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-500">
                  Sayfa {currentPage + 2} / {totalPages}
                </span>

                <h4 className="mt-1 text-base sm:text-lg font-bold text-slate-900 transition-colors group-hover:text-red-600">
                  Haberin devamını okumak için tıklayın
                </h4>

                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Kaldığınız yerden devam edin • Makalenin diğer ayrıntıları
                </p>
              </div>

              {/* Aksiyon Butonu */}
              <div className="relative z-10 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all duration-200 group-hover:bg-red-700 group-hover:shadow-md">
                  <span>Sayfaya Geç</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handlePageChange(0)}
              className="group relative mt-6 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100/80 cursor-pointer text-center"
            >
              <div className="flex items-center justify-center gap-2.5 text-xs font-bold text-slate-700 transition-colors group-hover:text-red-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-2xs group-hover:rotate-[-45deg] transition-transform">
                  <RotateCcw className="h-3.5 w-3.5" />
                </span>
                <span>Tüm sayfaları okudunuz • Haberin Başına Dön (1. Sayfa)</span>
              </div>
            </button>
          )}

          {/* Sayfa Numaraları (Dairesel Steps Butonları + Bağlantı Çizgisi) */}
          <div className="relative mt-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>

            <div className="relative flex items-center gap-2.5 sm:gap-3 bg-white px-4">
              {currentPage > 0 && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Önceki Sayfa"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-red-300 hover:bg-red-50/50 hover:text-red-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              {Array.from({ length: totalPages }, (_, i) => {
                const isActive = i === currentPage;
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePageChange(i)}
                    aria-label={`Sayfa ${pageNum}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full text-sm font-black transition-all duration-200 ${
                      isActive
                        ? "border-2 border-red-600 bg-red-600 text-white shadow-md shadow-red-600/25 scale-105"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50/60 hover:text-red-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {currentPage < totalPages - 1 && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Sonraki Sayfa"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-red-300 hover:bg-red-50/50 hover:text-red-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Tek Sayfalı Haberlerde Sade Kaynak Alanı */
        <div className="mt-8 border-t border-slate-200/80 pt-4">
          <p className="text-xs font-semibold text-slate-500">
            Kaynak: <span className="font-bold text-slate-800">{source}</span>
          </p>
        </div>
      )}
    </div>
  );
}
