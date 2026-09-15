"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Link2,
  List,
  Quote,
  Code,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Type,
  RemoveFormatting,
  Image as ImageIcon,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { chatGptMakalesiniAyristir } from "@/lib/chatgptAyristirici";
import { uploadsApi } from "@/lib/istemci";

type ZenginMetinEditoruProps = {
  value: string;
  onChange: (value: string) => void;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function markdownToHtml(value: string): string {
  if (!value) return "";
  return value
    .split(/\n\s*\n/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) return `<h${heading[1].length}>${escapeHtml(heading[2])}</h${heading[1].length}>`;
      if (trimmed.startsWith("> ")) return `<blockquote>${escapeHtml(trimmed.slice(2))}</blockquote>`;
      if (/^[-*] /.test(trimmed)) return `<ul>${trimmed.split("\n").map((line) => `<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      if (/^\d+\. /.test(trimmed)) return `<ol>${trimmed.split("\n").map((line) => `<li>${escapeHtml(line.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
      if (trimmed.startsWith("```") && trimmed.endsWith("```")) return `<pre>${escapeHtml(trimmed.slice(3, -3).trim())}</pre>`;
      const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        return `<p><img src="${escapeHtml(imgMatch[2])}" alt="${escapeHtml(imgMatch[1])}" style="max-width:100%;height:auto;border-radius:0.75rem;margin:1rem 0;display:block;" /></p>`;
      }
      const formattedLines = trimmed
        .split("\n")
        .map((l) => escapeHtml(l).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>"))
        .join("<br />");
      return `<p>${formattedLines}</p>`;
    })
    .join("");
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(nodeToMarkdown).join("");
  const content = Array.from(node.childNodes).map(nodeToMarkdown).join("");
  const tag = node.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return `${"#".repeat(Number(tag.slice(1)))} ${content.trim()}\n\n`;
  if (tag === "strong" || tag === "b") return `**${content}**`;
  if (tag === "em" || tag === "i") return `*${content}*`;
  if (tag === "a") return `[${content}](${node.getAttribute("href") || ""})`;
  if (tag === "blockquote") return `> ${content.trim()}\n\n`;
  if (tag === "pre") return `\`\`\`\n${content.trim()}\n\`\`\`\n\n`;
  if (tag === "br") return "\n";
  if (tag === "img") return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})\n\n`;
  if (tag === "figure") {
    const img = node.querySelector("img");
    if (img) return `![${img.getAttribute("alt") || ""}](${img.getAttribute("src") || ""})\n\n`;
  }
  if (tag === "li") return content.trim();
  if (tag === "ul" || tag === "ol") {
    const items = Array.from(node.children)
      .filter((child) => child.tagName.toLowerCase() === "li")
      .map((child, index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${nodeToMarkdown(child).trim()}`);
    return `${items.join("\n")}\n\n`;
  }
  if (["p", "div"].includes(tag)) return `${content.trim()}\n\n`;
  return content;
}

function htmlToMarkdown(element: HTMLElement): string {
  return Array.from(element.childNodes)
    .map(nodeToMarkdown)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ZenginMetinEditoru({ value, onChange }: ZenginMetinEditoruProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedValue = useRef<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<string>("p");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Görsel Ekleme Durumları
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!editorRef.current || lastEmittedValue.current === value) return;
    editorRef.current.innerHTML = markdownToHtml(value);
    lastEmittedValue.current = value;
  }, [value]);

  async function handleImageFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Görsel boyutu 5 MB'dan küçük olmalıdır.");
      return;
    }
    setImageError("");
    setUploadingImage(true);
    try {
      const res = await uploadsApi.image(file);
      setImageUrl(res.url);
    } catch {
      setImageError("Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleInsertImage() {
    if (!imageUrl.trim()) return;
    editorRef.current?.focus();
    const alt = imageAlt.trim() || "Haber görseli";
    const cleanUrl = imageUrl.trim();
    const htmlToInsert = `<p><img src="${escapeHtml(cleanUrl)}" alt="${escapeHtml(alt)}" style="max-width:100%;height:auto;border-radius:0.75rem;margin:1rem 0;display:block;" /></p><p><br /></p>`;
    document.execCommand("insertHTML", false, htmlToInsert);
    emitChange();
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageError("");
  }

  const updateActiveStates = useCallback(() => {
    if (typeof window === "undefined" || !editorRef.current) return;
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      let node: Node | null = selection.anchorNode;
      let block = "p";
      while (node && node !== editorRef.current) {
        if (node instanceof HTMLElement) {
          const tag = node.tagName.toLowerCase();
          if (["h1", "h2", "h3", "h4", "h5", "h6", "pre", "blockquote", "p", "ul", "ol", "li"].includes(tag)) {
            block = tag;
            break;
          }
        }
        node = node.parentNode;
      }
      setActiveBlock(block);
    } catch {
      // safe fallback
    }
  }, []);

  function emitChange() {
    if (editorRef.current) {
      const markdown = htmlToMarkdown(editorRef.current);
      lastEmittedValue.current = markdown;
      onChange(markdown);
      updateActiveStates();
    }
  }

  function command(name: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    emitChange();
  }

  function toggleBlock(targetTag: "h2" | "h3" | "blockquote" | "pre" | "p") {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      document.execCommand("formatBlock", false, targetTag === "p" ? "<p>" : targetTag);
      emitChange();
      return;
    }

    let node: Node | null = selection.anchorNode;
    let blockEl: HTMLElement | null = null;
    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement) {
        const tag = node.tagName.toLowerCase();
        if (["h1", "h2", "h3", "h4", "h5", "h6", "pre", "blockquote", "p"].includes(tag)) {
          blockEl = node;
          break;
        }
      }
      node = node.parentNode;
    }

    const currentTag = blockEl ? blockEl.tagName.toLowerCase() : "p";

    // Zaten hedef formattaysa veya 'p' istendiyse normal paragrafa döndür
    if (currentTag === targetTag || targetTag === "p") {
      if (blockEl && currentTag !== "p") {
        const p = document.createElement("p");
        p.innerHTML = blockEl.innerHTML;
        blockEl.parentNode?.replaceChild(p, blockEl);

        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        document.execCommand("formatBlock", false, "<p>");
      }
    } else {
      // Farklı bir formata dönüştürülüyor
      if (blockEl && (currentTag === "pre" || currentTag === "blockquote" || currentTag.startsWith("h"))) {
        const newEl = document.createElement(targetTag);
        newEl.innerHTML = blockEl.innerHTML;
        blockEl.parentNode?.replaceChild(newEl, blockEl);

        const range = document.createRange();
        range.selectNodeContents(newEl);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        document.execCommand("formatBlock", false, `<${targetTag}>`);
      }
    }

    emitChange();
  }

  function link() {
    const url = window.prompt("Bağlantı adresi (URL):");
    if (url) command("createLink", url);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const plainText = e.clipboardData.getData("text/plain");
    if (!plainText) return;

    let contentToInsert = plainText;
    if (/SEO Title:|Meta Description:|Slug:|Excerpt:|Odak Anahtar/i.test(plainText)) {
      const parsed = chatGptMakalesiniAyristir(plainText);
      contentToInsert = parsed.content;
    }

    const cleanHtml = markdownToHtml(contentToInsert);
    document.execCommand("insertHTML", false, cleanHtml);
    emitChange();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Escape basıldığında kod veya alıntı bloğundan anında çık
    if (e.key === "Escape") {
      if (activeBlock === "pre" || activeBlock === "blockquote") {
        e.preventDefault();
        toggleBlock("p");
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
      {/* Araç Çubuğu */}
      <div
        className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/90 px-3 py-2"
        onMouseDown={(event) => event.preventDefault()}
      >
        {/* Geri Al / Yinele */}
        <button
          type="button"
          onClick={() => command("undo")}
          title="Geri Al (Ctrl+Z)"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => command("redo")}
          title="Yinele (Ctrl+Y)"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-slate-300" />

        {/* Normal Metin (Paragraf) */}
        <button
          type="button"
          onClick={() => toggleBlock("p")}
          title="Normal Paragraf (P)"
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition-all cursor-pointer ${
            activeBlock === "p"
              ? "bg-slate-200/80 text-slate-900 shadow-2xs font-bold"
              : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Type className="h-3.5 w-3.5" />
          <span>Normal</span>
        </button>

        {/* H2 Başlık */}
        <button
          type="button"
          onClick={() => toggleBlock("h2")}
          title={activeBlock === "h2" ? "Başlığı kaldır (Normal metne dönüştür)" : "Büyük Başlık (H2)"}
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs transition-all cursor-pointer ${
            activeBlock === "h2"
              ? "bg-slate-900 text-white font-bold shadow-2xs"
              : "font-semibold text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Heading2 className="h-3.5 w-3.5" />
          <span>H2</span>
        </button>

        {/* H3 Başlık */}
        <button
          type="button"
          onClick={() => toggleBlock("h3")}
          title={activeBlock === "h3" ? "Alt başlığı kaldır (Normal metne dönüştür)" : "Alt Başlık (H3)"}
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs transition-all cursor-pointer ${
            activeBlock === "h3"
              ? "bg-slate-900 text-white font-bold shadow-2xs"
              : "font-semibold text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Heading3 className="h-3.5 w-3.5" />
          <span>H3</span>
        </button>

        <div className="mx-1 h-4 w-px bg-slate-300" />

        {/* Kalın & İtalik & Bağlantı */}
        <button
          type="button"
          onClick={() => command("bold")}
          title="Kalın (Ctrl+B)"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isBold
              ? "bg-slate-200/90 text-slate-900 font-bold"
              : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => command("italic")}
          title="İtalik (Ctrl+I)"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isItalic
              ? "bg-slate-200/90 text-slate-900 font-bold"
              : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={link}
          title="Bağlantı Ekle"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowImageModal((v) => !v);
            setImageError("");
          }}
          title="Makale İçine Görsel Ekle"
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition-colors cursor-pointer ${
            showImageModal
              ? "bg-slate-900 text-white font-bold"
              : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Görsel Ekle</span>
        </button>

        <div className="mx-1 h-4 w-px bg-slate-300" />

        {/* Liste */}
        <button
          type="button"
          onClick={() => command("insertUnorderedList")}
          title="Madde İşaretli Liste"
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors cursor-pointer ${
            activeBlock === "ul" || activeBlock === "li"
              ? "bg-slate-200/90 text-slate-900 font-bold"
              : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <List className="h-3.5 w-3.5" />
          <span>Liste</span>
        </button>

        {/* Alıntı */}
        <button
          type="button"
          onClick={() => toggleBlock("blockquote")}
          title={activeBlock === "blockquote" ? "Alıntıyı kaldır (Normal metne dönüştür)" : "Alıntı Bloğu"}
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors cursor-pointer ${
            activeBlock === "blockquote"
              ? "bg-slate-900 text-white font-bold"
              : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Quote className="h-3.5 w-3.5" />
          <span>{activeBlock === "blockquote" ? "Alıntı (Kaldır)" : "Alıntı"}</span>
        </button>

        {/* Kod Bloğu */}
        <button
          type="button"
          onClick={() => toggleBlock("pre")}
          title={activeBlock === "pre" ? "Kod bloğunu kaldır (Normal paragrafa dönüştür)" : "Kod Bloğu"}
          className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-mono transition-all cursor-pointer ${
            activeBlock === "pre"
              ? "bg-rose-600 text-white font-bold shadow-xs hover:bg-rose-700"
              : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>{activeBlock === "pre" ? "Kodu Kaldır (Normal Yap)" : "Kod"}</span>
        </button>

        <div className="mx-1 h-4 w-px bg-slate-300" />

        {/* Biçimi Temizle */}
        <button
          type="button"
          onClick={() => {
            command("removeFormat");
            toggleBlock("p");
          }}
          title="Tüm Biçimlendirmeleri Temizle"
          className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer ml-auto"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[11px]">Biçimi Temizle</span>
        </button>
      </div>

      {/* Görsel Ekleme Paneli */}
      {showImageModal && (
        <div className="border-b border-slate-200 bg-slate-50/95 p-3.5 sm:p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">
                Makale İçine Görsel Ekle
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Dosya Yükle */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Dosyadan Yükle (Maks 5 MB)
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors">
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-slate-500" />
                    <span>{imageUrl ? "Görsel Yüklendi ✓" : "Bilgisayardan Seç"}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />
              </label>
            </div>

            {/* Veya URL */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Veya Görsel URL&apos;si
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Görsel Önizleme */}
          {imageUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Önizleme"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800">Görsel Seçildi</span>
                <span className="block text-[10px] text-slate-400 truncate">{imageUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  setImageAlt("");
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
              >
                Kaldır
              </button>
            </div>
          )}

          {/* Alt Metin & Ekle Butonu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Görsel açıklaması / Alt metin (Örn: Yapay Zeka Laboratuvarı)"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
            <button
              type="button"
              disabled={!imageUrl.trim()}
              onClick={handleInsertImage}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            >
              İçeriğe Yerleştir
            </button>
          </div>

          {imageError && (
            <p className="text-[11px] font-medium text-rose-600">{imageError}</p>
          )}
        </div>
      )}

      {/* Düzenleyici Alanı */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onSelect={updateActiveStates}
        onInput={emitChange}
        className="min-h-[320px] p-5 text-sm leading-relaxed text-slate-800 focus:outline-none [&>p]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mb-2.5 [&>h2]:mt-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-slate-900 [&>h3]:mb-2 [&>h3]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-400 [&>blockquote]:bg-indigo-50/40 [&>blockquote]:py-2 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-700 [&>blockquote]:rounded-r-lg [&>blockquote]:my-3 [&>pre]:bg-slate-900 [&>pre]:text-emerald-300 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:font-mono [&>pre]:text-xs [&>pre]:my-3 [&>pre]:border [&>pre]:border-slate-800 [&>pre]:overflow-x-auto"
        role="textbox"
        aria-label="Haber içeriği"
      />

      {/* Alt Bilgi İpucu Çubuğu */}
      {activeBlock === "pre" && (
        <div className="flex items-center justify-between border-t border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <Code className="h-3.5 w-3.5 text-rose-600" />
            <span>Şu anda bir <strong>Kod Bloğu</strong> içindesiniz.</span>
          </div>
          <button
            type="button"
            onClick={() => toggleBlock("p")}
            className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Normal Metne Dönüştür
          </button>
        </div>
      )}
    </div>
  );
}
