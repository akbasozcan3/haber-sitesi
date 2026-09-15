"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { newsletterApi, ApiError } from "@/lib/istemci";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function NewsletterWidget() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);

    try {
      await newsletterApi.subscribe(email.trim());
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Bülten kaydı yapılırken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Kart Başlığı */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Mail className="h-4 w-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
            {settings.site_title || "Zernews"} Bülten
          </span>
        </div>
        <span className="text-[11px] font-semibold text-neutral-400">
          Haftalık
        </span>
      </div>

      <div className="mt-3.5">
        <h4 className="text-base font-black tracking-tight text-neutral-900">
          Teknoloji Gündemini Kaçırmayın
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Yapay zeka, yerli girişimler ve yatırım turlarına dair en kritik analizler her sabah gelen kutunuzda.
        </p>
      </div>

      {submitted ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h5 className="text-xs font-bold text-emerald-900">Aramıza Hoş Geldiniz!</h5>
          <p className="mt-1 text-[11px] text-emerald-700 leading-relaxed">
            Kaydınız başarıyla tamamlandı. İlk bülteniniz yakında e-postanıza ulaşacak.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-[11px] font-semibold text-rose-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresinizi girin..."
              required
              disabled={loading}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/80 pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-red-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] px-4 py-2.5 text-xs font-extrabold text-white transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <span>Ücretsiz Abone Ol</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Spam yok · Ücretsiz</span>
            </span>
            <span className="text-neutral-400 text-[10px]">Tek tıkla ayrılma</span>
          </div>
        </form>
      )}
    </div>
  );
}
