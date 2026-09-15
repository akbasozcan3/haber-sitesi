"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authApi } from "@/lib/istemci";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import SiteLogo from "@/components/common/SiteLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem("haber_admin_remember_email");
      const isRemember = window.localStorage.getItem("haber_admin_remember");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(isRemember !== "false");
      }
    } catch {}
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login(email.trim(), password, rememberMe);
      router.replace("/admin");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Giriş yapılamadı. E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#0d1117] px-4 py-12 text-slate-100 selection:bg-red-600 text-white selection:text-neutral-950">
      {/* Arka Plan Ambiyansı */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-red-600 text-white/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO (Görkemli, Büyük & Tam Ortalanmış) */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center transition-all duration-200 hover:opacity-90 active:scale-95"
          >
            <SiteLogo
              height={96}
              className="flex items-center justify-center"
              imgClassName="mx-auto w-auto max-h-24 sm:max-h-28 max-w-[340px] sm:max-w-[400px] object-contain drop-shadow-xl"
              textClassName="text-4xl font-black tracking-tight sm:text-5xl text-white text-center"
            />
          </Link>
        </div>

        {/* GİRİŞ FORMU */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">Yönetici Girişi</h2>
            <p className="mt-1 text-xs text-slate-400">
              Zernews içeriklerini yönetmek için yetkili hesabınızla giriş yapın.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-800/60 bg-rose-950/40 p-3.5 text-xs font-semibold text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* E-posta */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@habersitesi.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-600 transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-600 transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Beni Hatırla Seçeneği */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="group flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-700 bg-slate-950 text-red-600 focus:ring-red-500/40 focus:ring-offset-0 transition cursor-pointer accent-red-600"
                />
                <span className="font-medium group-hover:text-white transition-colors">Beni hatırla</span>
              </label>

              <span className="text-[11px] font-medium text-slate-500 select-none">
                30 Gün Boyunca Aktif
              </span>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Oturum Açılıyor...</span>
                </>
              ) : (
                <>
                  <span>Yönetim Paneline Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
