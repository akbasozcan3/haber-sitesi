"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, ChevronRight, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import type { Category } from "@/types/uygulama";

interface CategoryCountSidebarProps {
  categories: Category[];
  activeCategorySlug?: string;
}

export default function CategoryCountSidebar({
  categories,
  activeCategorySlug,
}: CategoryCountSidebarProps) {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subMessage, setSubMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setSubStatus("loading");
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost:8000")
          ? process.env.NEXT_PUBLIC_API_URL
          : "/api";
      const res = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubStatus("success");
        setSubMessage(data.message || "Bültene başarıyla kaydoldunuz!");
        setEmail("");
      } else {
        setSubStatus("error");
        setSubMessage(data.message || "Bir hata oluştu.");
      }
    } catch {
      setSubStatus("error");
      setSubMessage("Bağlantı hatası oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Kategoriler ve Sayı Adetleri Kartı */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-2xs">
        {/* Başlık */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-red-600" />
            <h3 className="text-base font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-red-600" />
              <span>Kategoriler</span>
            </h3>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Arşiv
          </span>
        </div>

        {/* Kategori Listesi */}
        <div className="divide-y divide-gray-50">
          {categories.map((cat) => {
            const isActive = activeCategorySlug === cat.slug;
            const count = cat.news_count ?? 0;

            return (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className={`group flex items-center justify-between py-2.5 px-2.5 -mx-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-red-50/80 text-red-600 font-extrabold"
                    : "text-neutral-700 hover:bg-neutral-50/80 hover:text-red-600"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                      isActive ? "bg-red-600" : "bg-neutral-300 group-hover:bg-red-600"
                    }`}
                  />
                  <span className="text-xs sm:text-[13px] font-bold truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-colors ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "bg-neutral-100 text-neutral-600 group-hover:bg-red-50 group-hover:text-red-600"
                    }`}
                  >
                    {count} {count === 1 ? "haber" : "haber"}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mini Bülten / E-Bülten Kartı */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-neutral-900 to-neutral-950 p-5 sm:p-6 text-white shadow-xs">
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-red-600/10 blur-2xl" />

        <div className="flex items-center gap-2 text-red-500 mb-2">
          <Mail className="h-4 w-4" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            Zernews Günlük Bülten
          </span>
        </div>

        <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
          Gündemi Kaçırmayın
        </h4>
        <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
          En son teknoloji, yapay zeka ve yatırım haberleri her sabah e-postanızda.
        </p>

        {subStatus === "success" ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{subMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-4 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz..."
              required
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-red-500 focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={subStatus === "loading"}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
            >
              {subStatus === "loading" ? "Kaydediliyor..." : "Ücretsiz Abone Ol"}
            </button>
            {subStatus === "error" && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-400 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{subMessage}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
