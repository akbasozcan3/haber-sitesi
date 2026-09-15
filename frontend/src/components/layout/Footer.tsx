"use client";

import { useState } from "react";
import Link from "next/link";
import { newsletterApi } from "@/lib/istemci";
import { Send, CheckCircle2, AlertCircle, Loader2, Mail, ShieldCheck } from "lucide-react";
import type { Category } from "@/types/uygulama";
import { DEFAULT_CATEGORIES } from "@/types/uygulama";
import SiteLogo from "@/components/common/SiteLogo";
import { useSiteSettings } from "@/context/SiteSettingsContext";

function TwitterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function Footer({ categories = [] }: { categories?: Category[] }) {
  const { settings } = useSiteSettings();
  const activeCats = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const cats = activeCats.filter((c) => c.show_in_navbar !== false).slice(0, 6);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await newsletterApi.subscribe(email.trim());
      setStatus("success");
      setMessage(res.message || "Bültenimize başarıyla abone oldunuz!");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Abonelik sırasında bir sorun oluştu.";
      setMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer id="site-footer" className="border-t border-neutral-200 bg-neutral-50 text-neutral-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Marka */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center">
              <SiteLogo textClassName="text-2xl font-black tracking-tight" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Türkiye ve küresel teknoloji ekosistemine odaklanan, internet girişimleri,
              yapay zeka, risk sermayesi ve dijital iş modellerini mercek altına alan
              bağımsız haber portalı.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                aria-label="X / Twitter"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Kategoriler */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Kategoriler
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {cats.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="transition-colors hover:text-neutral-900"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Kurumsal
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/haberler" className="transition-colors hover:text-neutral-900">
                  Tüm Haberler
                </Link>
              </li>
              <li>
                <Link href="/kunye" className="transition-colors hover:text-neutral-900">
                  Künye
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-neutral-900">
                  Yönetim Paneli
                </Link>
              </li>
            </ul>
          </div>

          {/* Bülten Formu */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Teknoloji Bülteni
              </h4>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              Girişimcilik, yapay zeka ve yatırım ekosistemindeki haftalık gelişmeleri doğrudan gelen kutunuza alın.
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 space-y-2.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="email"
                    placeholder="eposta@adresiniz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                    className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-50 transition-all shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Abone Ol</span>
                      <Send className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Spam yok · Dilediğiniz an tek tıkla ayrılabilirsiniz.</span>
              </div>

              {status === "success" && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 animate-in fade-in pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{message}</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in pt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-neutral-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {settings.site_title || "Zernews"}. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-5">
            <Link href="/gizlilik" className="transition-colors hover:text-neutral-700">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-sartlari" className="transition-colors hover:text-neutral-700">
              Kullanım Şartları
            </Link>
            <Link href="/kvkk" className="transition-colors hover:text-neutral-700">
              KVKK Metni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
