"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

interface PaylasimButonlariProps {
  title: string;
  shareUrl: string;
  className?: string;
  showLabel?: boolean;
}

function XIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.031 2c-5.516 0-9.991 4.475-9.991 9.991 0 1.763.459 3.486 1.332 5.001L2 22l5.161-1.353a9.948 9.948 0 0 0 4.87 1.264h.004c5.515 0 9.99-4.474 9.99-9.991 0-2.67-1.039-5.179-2.928-7.07A9.927 9.927 0 0 0 12.031 2zm5.824 14.184c-.244.686-1.42 1.309-1.961 1.391-.492.073-1.116.104-1.801-.114-.415-.132-.947-.308-1.632-.604-2.871-1.241-4.735-4.148-4.878-4.34-.143-.192-1.163-1.547-1.163-2.951 0-1.404.733-2.095.994-2.381.261-.286.571-.358.761-.358.191 0 .381.002.548.01.176.009.412-.067.644.492.238.572.81 1.979.882 2.122.071.143.119.31.024.499-.095.191-.143.31-.286.477-.143.167-.3.372-.429.5-.143.142-.292.298-.126.584.167.286.741 1.222 1.591 1.98 1.094.975 2.016 1.277 2.302 1.419.286.143.452.119.619-.071.167-.191.714-.834.905-1.12.191-.286.381-.238.643-.143.262.095 1.666.786 1.952.929.286.143.476.214.547.333.072.12.072.691-.172 1.377z" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TelegramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.065-1.226-.46-1.901-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.1-.002.321.023.465.14.119.096.16.227.171.325z" />
    </svg>
  );
}

export default function PaylasimButonlari({
  title,
  shareUrl,
  className = "",
  showLabel = true,
}: PaylasimButonlariProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl || (typeof window !== "undefined" ? window.location.href : ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className="text-[11px] font-black uppercase tracking-[.18em] text-neutral-400 select-none mr-1">
          Paylaş
        </span>
      )}

      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="X'te Paylaş"
        aria-label="X'te Paylaş"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-neutral-700 transition-all duration-200 hover:border-black hover:bg-black hover:text-white hover:scale-105 active:scale-95 shadow-2xs"
      >
        <XIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp'ta Paylaş"
        aria-label="WhatsApp'ta Paylaş"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-neutral-700 transition-all duration-200 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white hover:scale-105 active:scale-95 shadow-2xs"
      >
        <WhatsAppIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn'de Paylaş"
        aria-label="LinkedIn'de Paylaş"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-neutral-700 transition-all duration-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:scale-105 active:scale-95 shadow-2xs"
      >
        <LinkedInIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Facebook'ta Paylaş"
        aria-label="Facebook'ta Paylaş"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-neutral-700 transition-all duration-200 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:scale-105 active:scale-95 shadow-2xs"
      >
        <FacebookIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Telegram'da Paylaş"
        aria-label="Telegram'da Paylaş"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-neutral-700 transition-all duration-200 hover:border-[#229ED9] hover:bg-[#229ED9] hover:text-white hover:scale-105 active:scale-95 shadow-2xs"
      >
        <TelegramIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
      </a>

      {/* Bağlantıyı Kopyala */}
      <div className="relative">
        <button
          onClick={copyLink}
          type="button"
          title="Bağlantıyı Kopyala"
          aria-label="Bağlantıyı Kopyala"
          className={`group flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs cursor-pointer ${
            copied
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-200/90 bg-white text-neutral-700 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          }`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 animate-in zoom-in" />
          ) : (
            <Link2 className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
          )}
        </button>

        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-in fade-in slide-in-from-bottom-1">
            Kopyalandı!
          </span>
        )}
      </div>
    </div>
  );
}
